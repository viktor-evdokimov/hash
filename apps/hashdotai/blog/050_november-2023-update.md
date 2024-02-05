---
title: "November 2023 Update"
date: "2023-11-30"
categories: 
  - "Company"
---

## HASH Browser Extension

_Passively create linked, structured data as you browse the web._

Many knowledge-based roles involve finding information on the web, reading or otherwise processing it, and then using it another tool, application, or workflow. For example, you might have responsibility for...

- **prospecting:** identifying sales leads, potential hires, or qualified investors (browsing LinkedIn)

- **selling:** turning pre-qualified leads into customers, or convincing prospective hires to join your firm (researching individuals or companies through their own websites and social media)

- **monitoring:** staying on top of competitor's feature sets and key hires, tracking your own brand's reputation, or watching for new rules and regulations that might impact your activities

- **research, learning and development:** exploring and understanding new areas, drawing connections between concepts, and constructing new ideas

The new **HASH Browser Extension** lets you do your job as normal, browsing the web for information of relevance. However, while you browse, it automatically (passively) captures the information relevant to you in a linked, structured form. The result is a magically created knowledge graph that grows as you browse, containing all of the information you've seen that's relevant to your work (e.g. people, companies, products, regulators, competitors, partners, etc... as well as their key attributes).

This automatically created knowledge graph is 'typed', which makes it simple to sync some or all data in or out with other systems.

It can also be used to provide 'context' to AI models, enabling you to use Large Language Models (LLMs), such as GPT-4, with up-to-date and precise knowledge about your industry.

The automatically-captured knowledge can also be augmented with your own manual additions, improving its comprehensiveness.

Everything added into the graph improves its future utility further, and as type definitions (e.g. the 'properties' of a person you care about) are expanded, so is the information that is collected as you browse. _In the future_ we'll be adding an ability to 'rewind' and automatically infer these properties on existing entities, too, **providing you with the power of hindsight**.

### **Key use cases**

#### 1\. Process Automation

Certain processes start, or are kicked off, when information of a certain type is encountered for the first time. For example...

Use Case: Prospecting

Looking for new clients, investment opportunities, or recruitment targets may involve scouring sources like LinkedIn, Crunchbase, or AngelList/Wellfound for potential leads.

These leads may be manually collated in a database or spreadsheet; or dumped into a record management system like a [CRM](https://hash.ai/glossary/crm), or [ATS](https://hash.ai/glossary/ats).

Once stored, the collected information may be "enriched" by connecting to third-party data providers such as Clearbit, Apollo, or RocketReach.

Once enriched, leads may be "scored", and sorted by their potential size, suitability, or other measure of attractiveness.

Typically, however, the search for clients starts on only one of a small number of sites (such as LinkedIn) and information from a prospect's official website or blog, social media accounts, videos, podcasts, or other rich media is never factored into their profile - or must be manually consumed by a salesperson down the line.

How HASH helps... the HASH browser extension enables structured data to be captured and attached to entities from anywhere on the web, without writing custom scrapers.

#### 2\. Research Assistant

Many workflows require researching the web to collect information and assemble it into a picture of something.

Example Use Cases

- **X-ray competitors:** document products, services, features, offerings, and prices.

- **Discover and compare:** collect the information you need to make a recommendation or arrive at a decision. Discover the "best steakhouse in New York", determine the "greenest city in the world", or analyze the "best place to raise a child".

- **Map out a topic:** understand key concepts in an area, and how they relate to each other, building a mindmap of key information.

- **Catalog people:** create a record of all of the people who participated in a particular event, or who are active on a given web forum.

How HASH helps: the HASH browser extension is your automated research assistant, effortlessly scraping structured, linked data from the web-pages you browse - and storing that information in a shared or private knowledge graph for focused exploration, and customizable visualization. The HASH browser extension passively builds links between entities over time as relationships are discovered on the web, as you browse.

#### 3\. Second Brain

Rather than simply log a history of the web-pages you visit, capture the concepts and key information contained within them, as well, for easy future reference and revisiting.

Example Use Cases

- **Querying and searching of everything you read online:** go beyond normal web history and find information contained within the contents of pages, as well, including through natural language searches.

- **Context provision to LLMs:** give GPT-4 or another LLM the ability to access your web, and improve the results it returns, incorporating knowledge captured by users in HASH into the AI's responses, as well as that information which has been automatically inferred.

How HASH helps: HASH allows users to directly search for information stored within it, and automatically "vectorizes" all of that information, so that it can be searched _by similarity_ and provided as context to AI models.

### Using the browser extension

Email [support@hash.ai](mailto:support@hash.ai) with a short sentence about your use case, to be invited to try the browser extension.

Getting started:

- Login to HASH, install the browser extension, and pin it to your browser.

- Head to the "Automated" tab, and click the switch under the "Auto-Inference" section up top to enable passive inference of entities as you browse.

- Staying on the "Automated" tab, scroll down to the "Limit Scope" section and add/remove any types you want to look for, and specific sites they should be searched for on. Alternatively, allow the discovery of entities across any site.

How the plugin works:

- Information created through the browser plugin is by default created in your personal HASH web, and in "draft" form which you can easily review before it is merged into your web.
    - This provides you with a safeguard against your browsing activity being made visible to other users.
    
    - It also protects your web against accidental pollution with entities that are not of interest.

- As you browse the web, new entities are created, and the attributes of existing entities already in your web are fleshed out further, with links added between them as relationships are recognized and additional entities are found.

- By clicking the plugin icon in your browser, you can also create a quick 'note' from anywhere, attaching the currently open web page as context.

- The plugin ships with both light and dark modes, matching your desktop environment and interface preferences.

Our next-up plans:

- **In the plugin:** support the auto-archival of any web page an entity is extracted from (as MHTML) preserving the original context for provenance and later inspection.

- **In the plugin:** introduce an “Active Research” mode, in which the research agent will silently, off-screen and in the background, follow links to scrape additional information about entities on linked pages (within permitted domains only) — even when you _don’t click_ on them and open up a page yourself. This results in graphs being built that are significantly larger and more comprehensive than those of human researchers browsing in standalone.

- **In the app:** allow users to define and set up 'automations' that can be run when new entities of specific types are added to graphs.

- **In the app:** provide more integrations that allow for entities in HASH to be 2-way synced with external applications (Google Sheets, AirTable, and various CRMs/ATSs are planned)

- **For developers:** allow authorized access to embeddings stored in a user's own web, or shared organizational web, via the API, so that entities in HASH can be provided as context to LlamaIndex, LangChain and other LLM application frameworks.

**If you'd like to use or test the plugin, please let us know your use case, and we'll send you an invite. Simply reach out by emailing [support@hash.ai](mailto:support@hash.ai)**