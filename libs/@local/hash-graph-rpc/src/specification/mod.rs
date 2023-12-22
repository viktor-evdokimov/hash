pub mod account;
pub(crate) mod generic;

/// Convenience macro for defining a service.
///
/// A service is defined as a struct with a set of procedures. Each procedure is defined as a struct
/// with a set of fields. These fields are the parameters of the procedure. The procedure then
/// returns a return value of a specific type.
///
/// The syntax for defining a service are as follows:
///
/// ```text
/// <visibility> service <name> {
///     <option>*
///     <procedure>*
/// }
/// ```
///
/// The `<visibility>` is the visibility of the service. This is usually `pub`, any Rust visibility
/// modifier is permitted.
///
/// The `<name>` is the name of the service. This is used as the default while deriving the service
/// id.
///
/// The `<option>` value are optional configuration values for the service itself, used to override
/// defaults. They are simple assignments. Current options are:
/// * `id = <value>`: Sets the service id to the given value. This is used to override the default
///   of deriving the ID from the name of the service.
/// * `version = <value>`: Sets the service version to the given value. This is used to override the
///   default of `0`.
///
/// The `<procedure>` value are the procedures of the service. They are defined as follows:
/// ```text
/// rpc <name>(<parameters>) -> <return>;
/// ```
///
/// The return type is optional. If not specified, the procedure returns `()`, in case the return
/// type omitted the `->` is omitted as well.
///
/// The `<parameters>` are the parameters of the procedure. They are defined as follows:
/// ```text
/// <visibility> <name>: <type>
/// ```
///
/// You can optionally specify the specific ID of a procedure by placing `[id=<value>]` after the
/// `rpc` keyword.
// I am personally not a huge fan of TT munchers, but I wasn't able to figure out a more clever way
// that allows one to define options (even if only at the beginning).
macro_rules! service {
    (@type[$vis:vis] procedure $name:ident()) => {
        #[derive(serde::Serialize, serde::Deserialize)]
        #[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
        #[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
        $vis struct $name;
    };

    (@type[$vis:vis] procedure $name:ident($($fields:tt)+)) => {
        #[derive(serde::Serialize, serde::Deserialize)]
        #[cfg_attr(target_arch = "wasm32", derive(tsify::Tsify))]
        #[cfg_attr(target_arch = "wasm32", tsify(into_wasm_abi, from_wasm_abi))]
        $vis struct $name {
            $($fields)+
        }
    };

    (@procedure[$vis:vis]) => {};

    (@procedure[$vis:vis] rpc$([id=$id:literal])? $name:ident($($fields:tt)*) $(-> $output:ty)?; $($rest:tt)*) => {
        service!(@type[$vis] procedure $name($($fields)*));

        impl $crate::harpc::procedure::RemoteProcedure for $name {
            #[allow(unused_parens)]
            type Response = ($($output)?);

            const ID: $crate::harpc::ProcedureId = [$($crate::harpc::ProcedureId::new($id) ,)? $crate::harpc::ProcedureId::derive(stringify!($name))][0];
        }

        service!(@procedure[$vis] $($rest)*);
    };

    (@procedure[$vis:vis] $_:tt $($rest:tt)*) => {
        service!(@procedure[$vis] $($rest)*);
    };

    (@extract version;) => {
        const VERSION: $crate::harpc::ServiceVersion = $crate::harpc::ServiceVersion::new(0);
    };

    (@extract version; option version = $value:expr; $($rest:tt)*) => {
        const VERSION: $crate::harpc::ServiceVersion = $crate::harpc::ServiceVersion::new($value);
    };

    (@extract version; $_:tt $($rest:tt)*) => {
        service!(@extract version; $($rest)*);
    };

    (@extract[$name:ident] id;) => {
        const ID: $crate::harpc::ServiceId = $crate::harpc::ServiceId::derive(stringify!($name));
    };

    (@extract[$name:ident] id; option id = $value:expr; $($rest:tt)*) => {
        const ID: $crate::harpc::ServiceId = $crate::harpc::ServiceId::new($value);
    };

    (@extract[$name:ident] id; $_:tt $($rest:tt)*) => {
        service!(@extract[$name] id; $($rest)*);
    };

    (@extract names;) => {
        $crate::types::Empty
    };

    (@extract names; rpc$([$($options:tt)*])? $name:ident $($rest:tt)*) => {
        $crate::types::Stack<$name, service!(@extract names; $($rest)*)>
    };

    (@extract names; $_:tt $($rest:tt)*) => {
        service!(@extract names; $($rest)*)
    };

    (@wasm #client[$vis:vis $service:ident]) => {};

    (@wasm #client[$vis:vis $service:ident] rpc$([$($options:tt)*])? $name:ident($($($args:tt)+)?) $(-> $output:ty)?; $($rest:tt)*) => {
        paste::paste! {
            #[doc = "Call the `" $name "` procedure of the `" $service "` service."]
            ///
            /// # Errors
            ///
            /// Returns an error if the request cannot be encoded, the response cannot be decoded, or if the
            /// remote encountered a transport error.
            // TODO: in the future I'd like to remove the `call` prefix, but `:camel` returns `PascalCase`(?)
            //     instead of `camelCase` which is what we want, and https://github.com/rustwasm/wasm-bindgen/issues/1818
            //     is still open.
            #[allow(unused_parens)]
            #[wasm_bindgen::prelude::wasm_bindgen(js_name = [< call $name:camel >])]
            pub async fn [< $name:snake >](client: & [<$service Client>], $(${ignore(args)} args: $name)?)
                -> Result<($($output)?), wasm_bindgen::JsValue>
            {
                client.client
                    .call($name { $(${ignore(args)} ..args)? })
                    .await
                    .map_err(|error| {
                        match serde_wasm_bindgen::to_value(&error) {
                            Ok(value) => value,
                            Err(error) => error.into(),
                        }
                    })
            }
        }

        service!(@wasm #client[$vis $service] $($rest)*);
    };

    (@wasm #client[$vis:vis $service:ident] $_:tt $($rest:tt)*) => {
        service!(@wasm #client[$vis $service] $($rest)*);
    };

    (@wasm[$vis:vis $service:ident] $($tt:tt)*) => {
        #[cfg(target_arch = "wasm32")]
        mod __wasm {
            use super::*;

            paste::paste! {
                #[wasm_bindgen::prelude::wasm_bindgen]
                struct [< $service Client >] {
                    client: $crate::harpc::client::Client<$service, $crate::specification::generic::DefaultEncoder>,
                }

                #[wasm_bindgen::prelude::wasm_bindgen]
                impl [< $service Client >] {
                    #[doc = "Create a new " $service " client."]
                    ///
                    /// # Errors
                    ///
                    /// This function can fail if the underlying transport fails to connect.
                    #[wasm_bindgen::prelude::wasm_bindgen(constructor)]
                    pub fn new(
                        remote: wasm_bindgen::JsValue,
                        actor: $crate::harpc::transport::message::actor::ActorId,
                    ) -> Result<[< $service Client >], wasm_bindgen::JsValue> {
                        let remote = serde_wasm_bindgen::from_value(remote)?;

                        let client = $crate::harpc::client::Client::new(
                                $crate::specification::generic::DefaultEncoder,
                                actor,
                                remote,
                                $crate::harpc::transport::TransportConfig::default()
                            ).map_err(|error| {
                                match serde_wasm_bindgen::to_value(&error) {
                                    Ok(value) => value,
                                    Err(error) => error.into(),
                                }
                            })?;

                        Ok(Self { client })
                    }
                }
            }


            service!(@wasm #client[$vis $service] $($tt)*);
        }
    };

    ($vis:vis service $name:ident {
        $($tt:tt)*
    }) => {
        $vis struct $name;

        impl $crate::harpc::service::Service for $name {
            type Procedures = service!(@extract names; $($tt)*);

            service!(@extract[$name] id; $($tt)*);
            service!(@extract version; $($tt)*);
        }

        service!(@procedure[$vis] $($tt)*);

        service!(@wasm[$vis $name] $($tt)*);
    };
}

pub(crate) use service;
