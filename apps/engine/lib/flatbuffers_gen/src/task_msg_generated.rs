#![allow(
    clippy::module_name_repetitions,
    clippy::must_use_candidate,
    clippy::cast_sign_loss,
    clippy::empty_enum,
    clippy::used_underscore_binding,
    clippy::redundant_static_lifetimes,
    clippy::redundant_field_names,
    unused_imports
)]
// automatically generated by the FlatBuffers compiler, do not modify

use std::{cmp::Ordering, mem};

use super::{
    batch_generated::*, metaversion_generated::*, serialized_generated::*,
    sync_state_interim_generated::*, target_generated::*,
};

extern crate flatbuffers;
use self::flatbuffers::{EndianScalar, Follow};

// struct TaskId, aligned to 1
#[repr(transparent)]
#[derive(Clone, Copy, PartialEq)]
pub struct TaskId(pub [u8; 16]);
impl Default for TaskId {
    fn default() -> Self {
        Self([0; 16])
    }
}
impl std::fmt::Debug for TaskId {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        f.debug_struct("TaskId")
            .field("inner", &self.inner())
            .finish()
    }
}

impl flatbuffers::SimpleToVerifyInSlice for TaskId {}
impl flatbuffers::SafeSliceAccess for TaskId {}
impl<'a> flatbuffers::Follow<'a> for TaskId {
    type Inner = &'a TaskId;

    #[inline]
    fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
        <&'a TaskId>::follow(buf, loc)
    }
}
impl<'a> flatbuffers::Follow<'a> for &'a TaskId {
    type Inner = &'a TaskId;

    #[inline]
    fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
        flatbuffers::follow_cast_ref::<TaskId>(buf, loc)
    }
}
impl<'b> flatbuffers::Push for TaskId {
    type Output = TaskId;

    #[inline]
    fn push(&self, dst: &mut [u8], _rest: &[u8]) {
        let src = unsafe {
            ::std::slice::from_raw_parts(self as *const TaskId as *const u8, Self::size())
        };
        dst.copy_from_slice(src);
    }
}
impl<'b> flatbuffers::Push for &'b TaskId {
    type Output = TaskId;

    #[inline]
    fn push(&self, dst: &mut [u8], _rest: &[u8]) {
        let src = unsafe {
            ::std::slice::from_raw_parts(*self as *const TaskId as *const u8, Self::size())
        };
        dst.copy_from_slice(src);
    }
}

impl<'a> flatbuffers::Verifiable for TaskId {
    #[inline]
    fn run_verifier(
        v: &mut flatbuffers::Verifier,
        pos: usize,
    ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
        use self::flatbuffers::Verifiable;
        v.in_buffer::<Self>(pos)
    }
}
impl<'a> TaskId {
    #[allow(clippy::too_many_arguments)]
    pub fn new(inner: &[i8; 16]) -> Self {
        let mut s = Self([0; 16]);
        s.set_inner(&inner);
        s
    }

    pub fn inner(&'a self) -> flatbuffers::Array<'a, i8, 16> {
        flatbuffers::Array::follow(&self.0, 0)
    }

    pub fn set_inner(&mut self, items: &[i8; 16]) {
        flatbuffers::emplace_scalar_array(&mut self.0, 0, items);
    }
}

// struct GroupIndex, aligned to 8
#[repr(transparent)]
#[derive(Clone, Copy, PartialEq)]
pub struct GroupIndex(pub [u8; 8]);
impl Default for GroupIndex {
    fn default() -> Self {
        Self([0; 8])
    }
}
impl std::fmt::Debug for GroupIndex {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        f.debug_struct("GroupIndex")
            .field("inner", &self.inner())
            .finish()
    }
}

impl flatbuffers::SimpleToVerifyInSlice for GroupIndex {}
impl flatbuffers::SafeSliceAccess for GroupIndex {}
impl<'a> flatbuffers::Follow<'a> for GroupIndex {
    type Inner = &'a GroupIndex;

    #[inline]
    fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
        <&'a GroupIndex>::follow(buf, loc)
    }
}
impl<'a> flatbuffers::Follow<'a> for &'a GroupIndex {
    type Inner = &'a GroupIndex;

    #[inline]
    fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
        flatbuffers::follow_cast_ref::<GroupIndex>(buf, loc)
    }
}
impl<'b> flatbuffers::Push for GroupIndex {
    type Output = GroupIndex;

    #[inline]
    fn push(&self, dst: &mut [u8], _rest: &[u8]) {
        let src = unsafe {
            ::std::slice::from_raw_parts(self as *const GroupIndex as *const u8, Self::size())
        };
        dst.copy_from_slice(src);
    }
}
impl<'b> flatbuffers::Push for &'b GroupIndex {
    type Output = GroupIndex;

    #[inline]
    fn push(&self, dst: &mut [u8], _rest: &[u8]) {
        let src = unsafe {
            ::std::slice::from_raw_parts(*self as *const GroupIndex as *const u8, Self::size())
        };
        dst.copy_from_slice(src);
    }
}

impl<'a> flatbuffers::Verifiable for GroupIndex {
    #[inline]
    fn run_verifier(
        v: &mut flatbuffers::Verifier,
        pos: usize,
    ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
        use self::flatbuffers::Verifiable;
        v.in_buffer::<Self>(pos)
    }
}
impl<'a> GroupIndex {
    #[allow(clippy::too_many_arguments)]
    pub fn new(inner: u64) -> Self {
        let mut s = Self([0; 8]);
        s.set_inner(inner);
        s
    }

    pub fn inner(&self) -> u64 {
        let mut mem = core::mem::MaybeUninit::<u64>::uninit();
        unsafe {
            core::ptr::copy_nonoverlapping(
                self.0[0..].as_ptr(),
                mem.as_mut_ptr() as *mut u8,
                core::mem::size_of::<u64>(),
            );
            mem.assume_init()
        }
        .from_little_endian()
    }

    pub fn set_inner(&mut self, x: u64) {
        let x_le = x.to_little_endian();
        unsafe {
            core::ptr::copy_nonoverlapping(
                &x_le as *const u64 as *const u8,
                self.0[0..].as_mut_ptr(),
                core::mem::size_of::<u64>(),
            );
        }
    }
}

pub enum TaskMsgOffset {}
#[derive(Copy, Clone, PartialEq)]

pub struct TaskMsg<'a> {
    pub _tab: flatbuffers::Table<'a>,
}

impl<'a> flatbuffers::Follow<'a> for TaskMsg<'a> {
    type Inner = TaskMsg<'a>;

    #[inline]
    fn follow(buf: &'a [u8], loc: usize) -> Self::Inner {
        Self {
            _tab: flatbuffers::Table { buf, loc },
        }
    }
}

impl<'a> TaskMsg<'a> {
    pub const VT_GROUP_INDEX: flatbuffers::VOffsetT = 10;
    pub const VT_METAVERSIONING: flatbuffers::VOffsetT = 12;
    pub const VT_PACKAGE_SID: flatbuffers::VOffsetT = 4;
    pub const VT_PAYLOAD: flatbuffers::VOffsetT = 14;
    pub const VT_TARGET: flatbuffers::VOffsetT = 8;
    pub const VT_TASK_ID: flatbuffers::VOffsetT = 6;

    #[inline]
    pub fn init_from_table(table: flatbuffers::Table<'a>) -> Self {
        TaskMsg { _tab: table }
    }

    #[allow(unused_mut)]
    pub fn create<'bldr: 'args, 'args: 'mut_bldr, 'mut_bldr>(
        _fbb: &'mut_bldr mut flatbuffers::FlatBufferBuilder<'bldr>,
        args: &'args TaskMsgArgs<'args>,
    ) -> flatbuffers::WIPOffset<TaskMsg<'bldr>> {
        let mut builder = TaskMsgBuilder::new(_fbb);
        builder.add_package_sid(args.package_sid);
        if let Some(x) = args.payload {
            builder.add_payload(x);
        }
        if let Some(x) = args.metaversioning {
            builder.add_metaversioning(x);
        }
        if let Some(x) = args.group_index {
            builder.add_group_index(x);
        }
        if let Some(x) = args.task_id {
            builder.add_task_id(x);
        }
        builder.add_target(args.target);
        builder.finish()
    }

    #[inline]
    pub fn package_sid(&self) -> u64 {
        self._tab
            .get::<u64>(TaskMsg::VT_PACKAGE_SID, Some(0))
            .unwrap()
    }

    #[inline]
    pub fn task_id(&self) -> &'a TaskId {
        self._tab.get::<TaskId>(TaskMsg::VT_TASK_ID, None).unwrap()
    }

    #[inline]
    pub fn target(&self) -> Target {
        self._tab
            .get::<Target>(TaskMsg::VT_TARGET, Some(Target::Python))
            .unwrap()
    }

    #[inline]
    pub fn group_index(&self) -> Option<&'a GroupIndex> {
        self._tab.get::<GroupIndex>(TaskMsg::VT_GROUP_INDEX, None)
    }

    #[inline]
    pub fn metaversioning(&self) -> Option<StateInterimSync<'a>> {
        self._tab
            .get::<flatbuffers::ForwardsUOffset<StateInterimSync>>(TaskMsg::VT_METAVERSIONING, None)
    }

    #[inline]
    pub fn payload(&self) -> Serialized<'a> {
        self._tab
            .get::<flatbuffers::ForwardsUOffset<Serialized>>(TaskMsg::VT_PAYLOAD, None)
            .unwrap()
    }
}

impl flatbuffers::Verifiable for TaskMsg<'_> {
    #[inline]
    fn run_verifier(
        v: &mut flatbuffers::Verifier,
        pos: usize,
    ) -> Result<(), flatbuffers::InvalidFlatbuffer> {
        use self::flatbuffers::Verifiable;
        v.visit_table(pos)?
            .visit_field::<u64>(&"package_sid", Self::VT_PACKAGE_SID, false)?
            .visit_field::<TaskId>(&"task_id", Self::VT_TASK_ID, true)?
            .visit_field::<Target>(&"target", Self::VT_TARGET, false)?
            .visit_field::<GroupIndex>(&"group_index", Self::VT_GROUP_INDEX, false)?
            .visit_field::<flatbuffers::ForwardsUOffset<StateInterimSync>>(
                &"metaversioning",
                Self::VT_METAVERSIONING,
                false,
            )?
            .visit_field::<flatbuffers::ForwardsUOffset<Serialized>>(
                &"payload",
                Self::VT_PAYLOAD,
                true,
            )?
            .finish();
        Ok(())
    }
}
pub struct TaskMsgArgs<'a> {
    pub package_sid: u64,
    pub task_id: Option<&'a TaskId>,
    pub target: Target,
    pub group_index: Option<&'a GroupIndex>,
    pub metaversioning: Option<flatbuffers::WIPOffset<StateInterimSync<'a>>>,
    pub payload: Option<flatbuffers::WIPOffset<Serialized<'a>>>,
}
impl<'a> Default for TaskMsgArgs<'a> {
    #[inline]
    fn default() -> Self {
        TaskMsgArgs {
            package_sid: 0,
            task_id: None, // required field
            target: Target::Python,
            group_index: None,
            metaversioning: None,
            payload: None, // required field
        }
    }
}
pub struct TaskMsgBuilder<'a: 'b, 'b> {
    fbb_: &'b mut flatbuffers::FlatBufferBuilder<'a>,
    start_: flatbuffers::WIPOffset<flatbuffers::TableUnfinishedWIPOffset>,
}
impl<'a: 'b, 'b> TaskMsgBuilder<'a, 'b> {
    #[inline]
    pub fn add_package_sid(&mut self, package_sid: u64) {
        self.fbb_
            .push_slot::<u64>(TaskMsg::VT_PACKAGE_SID, package_sid, 0);
    }

    #[inline]
    pub fn add_task_id(&mut self, task_id: &TaskId) {
        self.fbb_
            .push_slot_always::<&TaskId>(TaskMsg::VT_TASK_ID, task_id);
    }

    #[inline]
    pub fn add_target(&mut self, target: Target) {
        self.fbb_
            .push_slot::<Target>(TaskMsg::VT_TARGET, target, Target::Python);
    }

    #[inline]
    pub fn add_group_index(&mut self, group_index: &GroupIndex) {
        self.fbb_
            .push_slot_always::<&GroupIndex>(TaskMsg::VT_GROUP_INDEX, group_index);
    }

    #[inline]
    pub fn add_metaversioning(
        &mut self,
        metaversioning: flatbuffers::WIPOffset<StateInterimSync<'b>>,
    ) {
        self.fbb_
            .push_slot_always::<flatbuffers::WIPOffset<StateInterimSync>>(
                TaskMsg::VT_METAVERSIONING,
                metaversioning,
            );
    }

    #[inline]
    pub fn add_payload(&mut self, payload: flatbuffers::WIPOffset<Serialized<'b>>) {
        self.fbb_
            .push_slot_always::<flatbuffers::WIPOffset<Serialized>>(TaskMsg::VT_PAYLOAD, payload);
    }

    #[inline]
    pub fn new(_fbb: &'b mut flatbuffers::FlatBufferBuilder<'a>) -> TaskMsgBuilder<'a, 'b> {
        let start = _fbb.start_table();
        TaskMsgBuilder {
            fbb_: _fbb,
            start_: start,
        }
    }

    #[inline]
    pub fn finish(self) -> flatbuffers::WIPOffset<TaskMsg<'a>> {
        let o = self.fbb_.end_table(self.start_);
        self.fbb_.required(o, TaskMsg::VT_TASK_ID, "task_id");
        self.fbb_.required(o, TaskMsg::VT_PAYLOAD, "payload");
        flatbuffers::WIPOffset::new(o.value())
    }
}

impl std::fmt::Debug for TaskMsg<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut ds = f.debug_struct("TaskMsg");
        ds.field("package_sid", &self.package_sid());
        ds.field("task_id", &self.task_id());
        ds.field("target", &self.target());
        ds.field("group_index", &self.group_index());
        ds.field("metaversioning", &self.metaversioning());
        ds.field("payload", &self.payload());
        ds.finish()
    }
}