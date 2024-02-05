---
title: "August 2023 Update"
date: "2023-08-31"
categories: 
  - "Company"
---

## Type Inheritance

**Entity types can now inherit from other entity types, making it easier to extend existing types and create your own which make sense.** For example, you might create an `Employee` entity type which inherits from `Person`, ensuring that any property value or link accepted on a `Person` can also be specified on any entity which is an `Employee`. Use child types to declare that any attribute of a parent type will also be applicable on instances of the child.

## Type Archival

**Types can now be archived.** Types created in error, or which are no longer in use, can now be hidden from view by archiving them in HASH.

## Org Management

This month we've expanded what you can do with orgs (introduced [last month](https://hash.ai/blog/july-2023-update)), building in support for:

- Adding an organization avatar

- Adding a website to an org, which now appears on its public profile page

- Accessing additional options via the org context menu, including for quickly viewing and editing an org's profile and members

- Allowing organization admins to remove other members

## Go Exploring

**It's now possible to view all of your own (as well as anybody else's _public_) types and entities at once.** Simply head to `[/types](https://app.hash.ai/types)` or `[/entities](https://app.hash.ai/entities)` in HASH to discover new types and entities. Improved search and filtering, as well as the ability to group results are planned for a future update.

**Archived types, pages and entities can now also be viewed.**

## Quality of life updates

**Various improvements.** App performance has been further improved, resolution flows for converting between types have been refined, and a large number of our outstanding known bugs have been eliminated. This includes the elimination of a long-standing (and particularly annoying) bug which could result in hotkeys being triggered incorrectly within the app, which has now been resolved. We app's default homepage has also been updated.