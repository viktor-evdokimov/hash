use std::net::SocketAddrV4;

use hash_graph_rpc::{specification::ClientImplementation, ActorId};
use specta::{Type, TypeMap};

#[allow(clippy::print_stdout)]
fn main() {
    println!("// This file is generated by `cargo run --example collect_types`");
    println!("// Do not edit this file directly");
    println!();
    println!("import {{Brand}} from 'ts-brand';");

    let mut types = TypeMap::default();

    let mut functions = vec![];

    for client_functions in inventory::iter::<ClientImplementation>() {
        functions.extend((client_functions.functions)(&mut types));
    }

    // types that are referenced in the constructor
    let ipv4 = SocketAddrV4::reference(&mut types, &[]);
    let actor = ActorId::reference(&mut types, &[]);

    let config = specta::ts::ExportConfig::new();

    for (_, data_type) in types.iter() {
        let output =
            specta::ts::export_named_datatype(&config, data_type, &types).expect("exported");

        println!("{output};");
    }

    for function in functions {
        let mut output = String::new();

        if function.asyncness {
            output.push_str("async ");
        }

        output.push_str("function ");
        output.push_str(&function.name);
        output.push('(');

        for (index, (name, type_)) in function.args.iter().enumerate() {
            if index > 0 {
                output.push_str(", ");
            }

            output.push_str(name);
            output.push_str(": ");
            output.push_str(&specta::ts::datatype(&config, type_, &types).expect("datatype"));
        }

        let return_type =
            specta::ts::datatype(&config, &function.result, &types).expect("exported");

        output.push_str("): ");
        output.push_str(&return_type);
        output.push(';');

        println!("{output}");
    }

    for ClientImplementation { name, .. } in inventory::iter::<ClientImplementation>() {
        println!("export class {name} {{");
        println!("free(): void;");

        let mut constructor = "constructor(remote: ".to_owned();
        constructor
            .push_str(&specta::ts::datatype(&config, &ipv4.inner, &types).expect("exported"));
        constructor.push_str(", actor: ");
        constructor
            .push_str(&specta::ts::datatype(&config, &actor.inner, &types).expect("exported"));
        constructor.push_str(");");

        let service_name = name.trim_end_matches("Client");
        println!("/**");
        println!(" * Create a new `{service_name}` client");
        println!(" *");
        println!(" * @param remote The remote address to connect to");
        println!(" * @param actor The actor to use for this client");
        println!(" */");
        println!("{constructor}");
        println!("}}");
    }
}
