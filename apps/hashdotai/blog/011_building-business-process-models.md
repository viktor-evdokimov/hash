---
title: "Business Process Modeling in HASH"
date: "2021-03-31"
cover: https://imagedelivery.net/EipKtqu98OotgfhvKf6Eew/ebbcec2b-c1f7-4311-f9ec-01aad0373600/public
categories: 
  - "Simulation"
---

## Business Process Modeling in HASH

Processes are the cornerstone of every company's operations. Defined and repeatable plans for satisfying business objectives differentiate a focused, efficient machine from a disorganized mess.

However, given the complexity and scale of modern businesses, it can be hard to create and optimize business processes. When dealing with tens of thousands of people managing hundred-step processes, we rapidly approach the limits of what any one person can design or understand.

At [HASH](https://hash.ai/platform) we're excited about the potential of computer-aided decision making - using the computer as a partner in deliberation and understanding, helping us find ideas and solutions that we couldn't otherwise by ourselves. Our approach is to use simulations of the real world to find the best outcomes, and maybe even more importantly, help people understand why a given choice, out of all the alternatives, is the right one to make.

We feel that business processes are a particularly promising domain to apply modeling and simulation:

- There are lots of tools for building process models, but relatively few quickly simulating and analyzing them

- Optimizations to business processes can quickly turn into millions of dollars of cost savings/new revenue

- Many of our users already manage projects, teams, and workflows that can be expressed as business processes

We've released a new plugin for HASH, built atop the [HASH API](https://docs.hash.ai/core/api), and utilizing the [HASH business process library](https://hash.ai/@hash/process), which provides a graphical user interface enabling easy simulation of business processes and operations.

## Process Modeling

<iframe style="position: absolute; top: 0; left: 0;" src="https://core.hash.ai/embed.html?project=%40hash%2Fcustomer-support-queue-process-model&amp;ref=stable&amp;view=process&amp;tabs=analysis%2Cprocess" width="100%" height="100%" frameborder="0" scrolling="auto"></p></p> <!-- /wp:html --> <div></div> <!-- wp:paragraph --> <p><strong>Key features:</strong></p> <!-- /wp:paragraph --> <div></div> <!-- wp:list --> <ul><!-- wp:list-item --> <li>Simple drag and drop interface for defining business process models.</li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li>When you've made your model you can, in one click, send it to a HASH simulation which will automatically interpret the model and use the correct simulation behaviors.</li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li>Run the simulation and explore the results to find the best process model and the best parameters.</li> <!-- /wp:list-item --></ul> <!-- /wp:list --> <div></div> <!-- wp:paragraph --> <p>And because it's all still powered with HASH, you can customize and extend any part of it. Combine it with other models, add data, modify a behavior, or do whatever fits your own case best. You can start building right away, and to learn more take a look at our how-to guides:</p> <!-- /wp:paragraph --> <div></div> <!-- wp:list --> <ul><!-- wp:list-item --> <li><a href="https://docs.hash.ai/core/concepts/designing-with-process-models/process-model-concepts">Key concepts in process modeling</a></li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li><a href="https://docs.hash.ai/core/concepts/designing-with-process-models/using-the-process-model-builder">Getting started with the HASH process modeling plugin</a></li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li><a href="https://docs.hash.ai/core/concepts/designing-with-process-models/using-data-in-a-process-model">Adding data to process models</a></li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li><a href="https://docs.hash.ai/core/concepts/designing-with-process-models/analyzing-process-models">Analyzing process models</a></li> <!-- /wp:list-item --> <div></div> <!-- wp:list-item --> <li><a href="https://docs.hash.ai/core/concepts/designing-with-process-models/experimenting-with-process-models">Running experiments with process models</a></li> <!-- /wp:list-item --></ul> <!-- /wp:list --> <div></div> <!-- wp:paragraph --> <p>Along with our <a href="https://docs.hash.ai/core/tutorials/building-process-models">video tutorial on building a ticket queue process model</a>.</p> <!-- /wp:paragraph --> <div></div> <!-- wp:paragraph --> <p>We'd love to know what you build. <a href="support@hash.ai">Drop us a line</a> or chat with us on <a href="https://discord.gg/BPMrGAhjPh">Discord</a>. Have fun simulating!</p> <!-- /wp:paragraph --> <div></div> <!-- wp:acf/key-concepts {"name":"acf/key-concepts","data":{"header":"About HASH","_header":"field_5fb645d2625de","body":"\u003cstrong\u003eHASH is an operating system for developing and executing simulations at scale.\u003c/strong\u003e Domain-specific interfaces and customized simulation 'tools' like the process modeling plugin in this article can be built using the \u003ca href=\u0022https://docs.hash.ai/core/api\u0022 target=\u0022_blank\u0022 rel=\u0022noreferrer noopener\u0022\u003eHASH API\u003c/a\u003e, transforming HASH into a tailored simulation tool for any niche problem-space.\r\n\r\nUnder the hood HASH provides:\r\n\u003cul\u003e\r\n \t\u003cli\u003ehigh-performance, optimized processing of simulations through \u003ca href=\u0022https://hash.ai/platform/engine\u0022\u003ehEngine\u003c/a\u003e\u003c/li\u003e\r\n \t\u003cli\u003etotal provenance, a zero-setup environment, and in-built tools for rendering simulations with \u003ca href=\u0022https://hash.ai/platform/core\u0022\u003ehCore\u003c/a\u003e\u003c/li\u003e\r\n \t\u003cli\u003einteroperability between simulations, and a library of pre-made components on \u003ca href=\u0022https://hash.ai/platform/index\u0022\u003ehIndex\u003c/a\u003e\u003c/li\u003e\r\n \t\u003cli\u003ethe ability to single-click scale simulations to millions of agents with \u003ca href=\u0022https://hash.ai/platform/cloud\u0022\u003ehCloud\u003c/a\u003e\u003c/li\u003e\r\n\u003c/ul\u003e","_body":"field_5fb64605625df"},"mode":"edit"} /--></x-turndown></iframe>