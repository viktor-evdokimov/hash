import { ReactNode } from "react";

import { StatusId } from "./statuses";
import { UseCaseId } from "./use-cases";
import { VariantId } from "./variants";

export type TechnologyTreeNodeData = {
  id: string;
  heading: ReactNode;
  body?: ReactNode;
  variant: VariantId;
  status: StatusId;
  useCases: UseCaseId[];
  parentIds?: string[];
};

export const technologyTreeData: TechnologyTreeNodeData[] = [
  {
    id: "0",
    heading: "Block Protocol Core",
    body: "Specification for passing structured data between blocks and embedding applications",
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "block-protocol",
  },
  {
    id: "1",
    heading: "UX/UI Outline",
    body: "Basic application screens and functionality outline",
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "infrastructure",
  },
  {
    id: "3",
    heading: "Block Protocol Graph Module",
    body: "Type System and methods for accessing structured data",
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "block-protocol",
  },
  {
    id: "4",
    heading: "Block Protocol Hook Module",
    body: "Inject native application experiences and handlers within blocks",
    parentIds: ["0"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "block-protocol",
  },
  {
    id: "5",
    heading: "Frontend App Scaffolding",
    body: "Basic application screens and frame implemented",
    parentIds: ["1"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "infrastructure",
  },
  {
    id: "6",
    heading: "Graph Layer",
    body: "Rust implementation of the Graph Module atop Postgres",
    parentIds: ["1", "3"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "infrastructure",
  },
  {
    id: "7",
    heading: "Text Hook Provider",
    body: "Hook provider for rich text-editing within blocks",
    parentIds: ["4"],
    status: "done",
    useCases: [
      "knowledge-management",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "infrastructure",
  },
  {
    id: "8",
    heading: "Core System Types",
    body: "User, workspace, and other key types required by HASH itself",
    parentIds: ["6"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "infrastructure",
  },
  {
    id: "9",
    heading: "Basic Primitive Blocks",
    body: "Key blocks such as heading, paragraph, image, etc.",
    parentIds: ["7"],
    status: "done",
    useCases: [
      "knowledge-management",
      "business-intelligence",
      "website-building",
    ],
    variant: "feature",
  },
  {
    id: "10",
    heading: "Entity Type Editor",
    body: "Interface for managing entity types in HASH",
    parentIds: ["8"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "11",
    heading: "Basic Authentication",
    body: "Implement login/logout/signup atop Kratos",
    parentIds: ["8"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "12",
    heading: "Block Protocol Service Module",
    body: "Allow blocks to connect to external services without handling integration logic themselves",
    parentIds: ["9"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "block-protocol",
  },
  {
    id: "13",
    heading: "Entity Editor",
    body: "Interface for managing entities in HASH",
    parentIds: ["10"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "14",
    heading: "Block Protocol API Middleware",
    body: "Handler for OpenAI, Mapbox and other third-party APIs",
    parentIds: ["12"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "block-protocol",
  },
  {
    id: "15",
    heading: "Linear Pages",
    body: "Single-column block-based documents",
    parentIds: ["5"],
    status: "done",
    useCases: ["knowledge-management", "business-intelligence"],
    variant: "feature",
  },
  {
    id: "16",
    heading: "Multiplayer Prototype",
    body: "Proof-of-concept multiplayer editing and live collaboration",
    parentIds: ["11"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "experiment",
  },
  {
    id: "17",
    heading: "Entity Archival (Soft Deletion)",
    body: "Ability to archive or hide entities including pages",
    parentIds: ["10", "3"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "18",
    heading: "Canvas Pages",
    body: "Freeform drag-and-drop canvases for blocks",
    parentIds: ["15"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "19",
    heading: "Block-Level Comments",
    body: "The ability to comment on blocks within pages",
    parentIds: ["15"],
    status: "done",
    useCases: ["knowledge-management", "business-intelligence"],
    variant: "feature",
  },
  {
    id: "20",
    heading: "Search Prototype",
    body: "MVP implementation of OpenSearch-based full text search",
    parentIds: ["15", "13"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
    ],
    variant: "experiment",
  },
  {
    id: "21",
    heading: "Task Executor",
    body: "Temporal-based executor for flows and other logic",
    parentIds: ["14"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "infrastructure",
  },
  {
    id: "22",
    heading: "@mentions",
    body: "Ability to @mention users and other entities within pages",
    parentIds: ["15", "7"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "23",
    heading: "API-Based Blocks",
    body: "OpenAI and Mapbox-enabled blocks built atop the Þ API middleware",
    parentIds: ["14"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "24",
    heading: "Command Bar",
    body: "Command or k-bar for quickly accessing AI capabilities and shortcuts",
    parentIds: ["20"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "25",
    heading: "Type Inheritance RFC",
    body: "Proposal for supporting type inheritance in the Block Protocol Graph Module",
    parentIds: ["3"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "block-protocol",
  },
  {
    id: "26",
    heading: "AI Type Creation",
    body: "LLM-assisted new and existing type suggestions",
    parentIds: ["21"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "27",
    heading: "User & Org Administration",
    body: "Basic account and shared workspace management",
    parentIds: ["8"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "28",
    heading: "Entity Validation",
    body: "Validate that entities comply with their schema when inserting and updating",
    parentIds: ["8", "17", "3"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "29",
    heading: "Type Archival (Soft Deletion)",
    body: "Ability to hide outdated or redundant types in the UI",
    parentIds: ["17"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "30",
    heading: "AI Entity Creation",
    body: "LLM-assisted new entity creation",
    parentIds: ["26"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "31",
    heading: "Block Protocol Actions Module",
    body: "Specification for users/apps defining block action-handling",
    parentIds: ["24"],
    status: "next-up",
    useCases: ["website-building", "internal-tools-apps"],
    variant: "block-protocol",
  },
  {
    id: "32",
    heading: "Type Inheritance",
    body: "Set parent types whose expected property and link types will be inherited",
    parentIds: ["25"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "33",
    heading: "Notifications",
    body: "User-facing in-app alerts upon notifiable events",
    parentIds: ["21", "22"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "34",
    heading: "Data Querying & Selection",
    body: "Interface for identifying and loading entities into blocks",
    parentIds: ["9"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "35",
    heading: "Authorization",
    body: "Permissions and access control",
    parentIds: ["27"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "36",
    heading: "Block Action Mapping",
    body: "Interface for mapping blocks to available actions",
    parentIds: ["31"],
    status: "future",
    useCases: ["website-building", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "37",
    heading: "Realtime Service",
    body: "Engine for synchronizing data between backend datastores, user sessions (via Collab), and external services (via Flows)",
    parentIds: ["16", "20"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "entity-storage-retrieval",
    ],
    variant: "infrastructure",
  },
  {
    id: "38",
    heading: "Multi-Type Entities",
    body: "Allow a single entity to have more than one assigned type",
    parentIds: ["32"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "39",
    heading: "Custom Data Types RFC",
    body: "Proposed specification extension allowing for user-defined non-primitive Data Types",
    parentIds: ["25"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "block-protocol",
  },
  {
    id: "40",
    heading: "Flows",
    body: "Scheduled and responsive execution of user-defined logic",
    parentIds: ["21"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "feature",
  },
  {
    id: "41",
    heading: "Advanced Blocks",
    body: "Blocks which allow users to query and insert multiple entities of varying types (e.g. table, kanban, timeline)",
    parentIds: ["34"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "42",
    heading: "External API & Webhooks",
    body: "API endpoints for interfacing with HASH designed for external user consumption",
    parentIds: ["35"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "43",
    heading: "API Transactions",
    body: "Complex API requests composed of multiple interdependent operations",
    parentIds: ["28"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "44",
    heading: "Data Mapping RFC",
    body: "Proposal for a system to map between data of different types",
    parentIds: ["39"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "block-protocol",
  },
  {
    id: "45",
    heading: "Custom Data Types",
    body: "Interface allowing user definition of non-primitive Data Types",
    parentIds: ["39"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "feature",
  },
  {
    id: "46",
    heading: "Structural Data Mapping",
    body: "Specify that different types are structurally related (or literally duplicative)",
    parentIds: ["44"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "feature",
  },
  {
    id: "47",
    heading: "Semantic Data Mapping",
    body: "Specify that different types are semantically related (or semantically the same as one another)",
    parentIds: ["44"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "feature",
  },
  {
    id: "48",
    heading: "File Entity Viewer",
    body: "Application-level support for rendering binary files using blocks on File entity pages",
    parentIds: ["13"],
    status: "in-progress",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "49",
    heading: "Integrations: One-time load",
    body: "Ability to ingest information from external services as entities ",
    parentIds: ["37"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "experiment",
  },
  {
    id: "50",
    heading: "Integrations: One-time write",
    body: "Ability to write information out to connected external services",
    parentIds: ["37"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "experiment",
  },
  {
    id: "51",
    heading: "Integrations: Realtime sync",
    body: "Ability to synchronize information to/fro external services via the Realtime Service",
    parentIds: ["37"],
    status: "done",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "experiment",
  },
  {
    id: "52",
    heading: "Action Blocks",
    body: "Basic blocks designed for data- and action-mapping (e.g. button, dropdown, etc.)",
    parentIds: ["36"],
    status: "future",
    useCases: ["website-building", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "53",
    heading: "Similarity Search",
    body: "Generation of per-entity, property, link and type embeddings, vector datastore backend, and frontend",
    parentIds: ["24", "37"],
    status: "future",
    useCases: [
      "knowledge-management",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "54",
    heading: "Multiplayer Editing",
    body: "Y CRDT-based production implementation of collaborative page, entity and type editing",
    parentIds: ["37"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "website-building",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "55",
    heading: "Entity/Property Hard Deletion",
    body: "Ability to permanently delete information from the backend datastore(s)",
    parentIds: ["43"],
    status: "future",
    useCases: ["knowledge-management", "entity-storage-retrieval"],
    variant: "feature",
  },
  {
    id: "56",
    heading: "Calculated Properties",
    body: "Programmatic calculation of properties, supported independently of Flows.",
    parentIds: ["45"],
    status: "future",
    useCases: ["knowledge-management", "data-management"],
    variant: "feature",
  },
  {
    id: "57",
    heading: "Apps",
    body: "Ability to bundle entites, types, and blocks on pages into distributable apps",
    parentIds: ["52"],
    status: "future",
    useCases: ["internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "58",
    heading: "Semantic Q&A",
    body: "Natural language questions and answers based on the contents of a workspace and (optionally) global graph",
    parentIds: ["53"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "59",
    heading: "Financial Accounting Datastore",
    body: "TigerBeetle-based backend for dedicated storage and processing of financial accounting data",
    parentIds: ["37"],
    status: "future",
    useCases: ["knowledge-management", "data-management"],
    variant: "feature",
  },
  {
    id: "60",
    heading: "Notion Integration",
    body: "Ability to one-time import information from Notion (two-way sync when Notion supports webhooks)",
    parentIds: ["49"],
    status: "future",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "61",
    heading: "Email Sending",
    body: "Support for user composition/triggering of emails via Flows",
    parentIds: ["40"],
    status: "future",
    useCases: ["website-building", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "62",
    heading: "Linear Integration",
    body: "Two-way sync of information with one or more Linear workspaces",
    parentIds: ["51"],
    status: "in-progress",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "63",
    heading: "Ramp Integration",
    body: "Ability to read information from Ramp and take actions via Flows",
    parentIds: ["59"],
    status: "future",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "64",
    heading: "Asana Integration",
    body: "Two-way sync of information with one or more Asana organizations",
    parentIds: ["51"],
    status: "future",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "65",
    heading: "GitHub Integration",
    body: "Two-way sync of information with GitHub and ability to trigger actions via Flows",
    parentIds: ["51"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "feature",
  },
  {
    id: "66",
    heading: "Brex Integration (read-only)",
    body: "Ability to read information from Brex and take actions via Flows",
    parentIds: ["59"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "feature",
  },
  {
    id: "67",
    heading: "Gmail/Google Workspace email sync",
    body: "Read and manage (two-way sync) emails stored in Gmail and Google Workspace",
    parentIds: ["61"],
    status: "future",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "68",
    heading: "App Store",
    body: "Publish and distribute or discover user-created HASH Applications",
    parentIds: ["57"],
    status: "future",
    useCases: ["internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "69",
    heading: "Text Search",
    body: "Production-ready implementation of full-text search",
    parentIds: ["58"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "feature",
  },
  {
    id: "70",
    heading: "Keyboard Navigability",
    body: "Full support for using HASH via keyboard alone",
    parentIds: ["72"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "71",
    heading: "Git Datastore",
    body: "libgit2 or Gitea-based backend for dedicated storage and processing of source code and Git repositories",
    parentIds: ["65"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
      "agent-based-simulation",
    ],
    variant: "infrastructure",
  },
  {
    id: "72",
    heading: "Shortcut Cheatsheet",
    body: "Easy, centralized in-app access to keyboard navigation documentation",
    parentIds: ["24"],
    status: "future",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "website-building",
      "internal-tools-apps",
      "agent-based-simulation",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "73",
    heading: "Simulation Blocks",
    body: "Replaces hCore, enabling simulations and experiments to be created and run in HASH",
    parentIds: ["71"],
    status: "future",
    useCases: ["agent-based-simulation"],
    variant: "feature",
  },
  {
    id: "74",
    heading: "Canvas AutoLayout",
    body: "Dynamically position blocks relative to one another",
    parentIds: ["18"],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
  {
    id: "75",
    heading: "Time Series Datastore",
    body: "Open-source (TBD) backend for dedicated storage and processing of time series data",
    parentIds: ["73"],
    status: "future",
    useCases: [
      "data-management",
      "business-intelligence",
      "agent-based-simulation",
    ],
    variant: "infrastructure",
  },
  {
    id: "76",
    heading: "Optimized Simulation Run Storage",
    body: "Move to a more efficient data format for storing simulation data (e.g. Parquet)",
    parentIds: ["75"],
    status: "future",
    useCases: ["agent-based-simulation"],
    variant: "infrastructure",
  },
  {
    id: "77",
    heading: "REPL Block",
    body: "Support for individually executable blocks (JavaScript/Python notebook-style) within pages",
    parentIds: ["76"],
    status: "future",
    useCases: [
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "78",
    heading: "Self-service hCloud",
    body: "Offered up until May 2023, we plan to re-introduce this as part of Flows",
    parentIds: ["76"],
    status: "future",
    useCases: ["agent-based-simulation"],
    variant: "feature",
  },
  {
    id: "79",
    heading: "Improved scalability",
    body: "Intelligent offloading of infrequently accessed data into cold storage",
    parentIds: ["76"],
    status: "future",
    useCases: ["knowledge-management", "data-management"],
    variant: "infrastructure",
  },
  {
    id: "80",
    heading: "Entity Labels",
    body: "Select properties that can be used to easily identify entities in HASH",
    parentIds: ["32"],
    status: "next-up",
    useCases: [
      "knowledge-management",
      "data-management",
      "internal-tools-apps",
    ],
    variant: "feature",
  },
  {
    id: "81",
    heading: "Rippling Integration",
    body: "Two-way sync of information and actions with the Rippling platform",
    parentIds: ["51"],
    status: "future",
    useCases: ["knowledge-management", "internal-tools-apps"],
    variant: "feature",
  },
  {
    id: "82",
    heading: "Advanced Authorization",
    body: "More granular permissions and access control",
    parentIds: ["35"],
    status: "in-progress",
    useCases: [
      "knowledge-management",
      "data-management",
      "business-intelligence",
      "internal-tools-apps",
      "entity-storage-retrieval",
    ],
    variant: "feature",
  },
  {
    id: "83",
    heading: "Type Forking",
    body: "Duplicate types while retaining a reference to the original (distinct from extension)",
    parentIds: ["46"],
    status: "future",
    useCases: ["knowledge-management"],
    variant: "feature",
  },
  {
    id: "84",
    heading: "Composite Blocks",
    body: "Nest blocks inside other blocks to create complex ",
    parentIds: ["41"],
    status: "future",
    useCases: [
      "knowledge-management",
      "internal-tools-apps",
      "website-building",
    ],
    variant: "feature",
  },
  {
    id: "85",
    heading: "Desktop App",
    body: "macOS, Windows & Linux applications, with full offline mode",
    parentIds: [],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
  {
    id: "86",
    heading: "Mobile App",
    body: "iOS & Android applications, with full offline mode",
    parentIds: [],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
  {
    id: "87",
    heading: "Type Renaming & Redirection",
    body: "Rename types already in-use, and seamlessly redirect old consumers",
    parentIds: [],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
  {
    id: "88",
    heading: "Federated Instances",
    body: "Connect a local instance of HASH to the global web of instances",
    parentIds: ["40", "42"],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
  {
    id: "89",
    heading: "Improved support for self-hosting",
    body: "Host your own HASH instance with no technical setup required",
    parentIds: ["85", "88"],
    status: "future",
    useCases: ["website-building"],
    variant: "feature",
  },
];
