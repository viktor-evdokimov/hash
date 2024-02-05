---
title: "March 2023 Update"
date: "2023-03-31"
cover: https://hash.ai/cdn-cgi/imagedelivery/EipKtqu98OotgfhvKf6Eew/89b31990-6c8c-44de-12fd-d9fa9d76fc00/public
categories: 
  - "Company"
---

## Lots of new blocks

In addition to some big improvements to the OpenAI-powered [AI Text](https://blockprotocol.org/@hash/blocks/ai-text), [AI Image](https://blockprotocol.org/@hash/blocks/ai-image), and Mapbox-enabled [Address](https://blockprotocol.org/@hash/blocks/address) blocks we introduced last month, we added a whole host of new blocks in March.

### AI Chat block

The [AI Chat block](https://blockprotocol.org/@hash/blocks/ai-chat) lets you interact with GPT-3.5 and GPT-4 through a chat-based interface, and persist those conversations (or any part of them), ready to pick back up in the future. The block's _read-only_ mode additionally provides a convenient way to share those conversations with others.

### Kanban boards

The [Kanban Board](https://blockprotocol.org/@hash/blocks/kanban-board) block provides you with an unlimited number of columns on which you can arrange information in 'cards'. It's useful for project planning, organizing information into categories, and tracking the status of items as they move through a process or flow. Lots of people also use them for collecting and organizing information more generally, for example as moodboards.

### Tables

The [Table](https://blockprotocol.org/@hash/blocks/table) block lets you store information in a grid. You know what a table is.

What's special about this table block is that it's been built using a special web technology called the "HTML Canvas".

Thanks to this, the block can support an unreasonably large amount of data (including more rows, in fact, than the 1,048,576 maximum allowed by the _latest_ version of Microsoft Excel!), loading fast, with users retaining a responsive, smooth-scrolling experience throughout.

Normally elements built using this performant technology aren't great for visually-impaired users who rely on tools known as "screen readers" to help them navigate the web, but the table block ensures that the experience for folks both with and without assistive technologies is top-notch, and that data is machine-readable (the other frequent issue that needs working around while using HTML Canvas).

### Structured data blocks

Speaking of machine-readability, this month saw two new _structured data_ blocks arrive on the [Þ Hub](https://blockprotocol.org/hub).

Structured data blocks (a) store information in a knowledge graph or database-ready format, and (b) provide machine-readable JSON-LD alongside their visible contents when rendered on a page.

The [FAQ block](https://blockprotocol.org/@hash/blocks/faq) allows questions and answers to be captured in such a manner, with optional question numbering and collapsible headings.

The [How-To block](https://blockprotocol.org/@hash/blocks/how-to) meanwhile stores step-by-step instructions, and "how-to" guides and information.

We also added basic JSON-LD markup to the existing image and video blocks.

### ...and Minesweeper

The Þ Hub is an infinitely extensible library of blocks... and blocks don't have to be boring! This month, we published a [Minesweeper block](https://blockprotocol.org/@hash/blocks/minesweeper), just for fun.

## Type editor improvements

We've improved the HASH type editor.

- It's at last possible to add a description to a type, helping you explain their meaning and capture instructions regarding their intended use.

- You can now enter special characters in the title, as well as type's descriptions.

- The "insert new" property type/link entity button will be made sticky and affixed to the bottom of the respective table as you scroll through long lists of property types/links.

## Block Protocol updates

- **Multiple API keys:** [Block Protocol](https://blockprotocol.org/) users can now generate multiple API keys, allowing them to connect to different environments with unique credentials.

- **Improved compatibility:** the Block Protocol for WordPress plugin has been updated to add support for older versions of MySQL and MariaDB, as well as compatibility with the next versions of Gutenberg.

- **Improved error messages:** the Block Protocol for WordPress plugin now displays more informative and easier to discover error messages

- **Service-enabled block previews:** it previously wasn't possible to demo blocks in the [Þ Hub](https://blockprotocol.org/hub) which required access to external services such as OpenAI and Mapbox. Now it is!

- **Verified badge on block listings:** we've added "verified" badges on Þ Hub listings that have been through a quality and security review process. [Learn more >](https://blockprotocol.org/docs/faq#how-does-block-verification-work)