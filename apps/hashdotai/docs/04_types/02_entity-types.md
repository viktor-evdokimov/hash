---
title: Entity Types
slug: hash/managing-your-data/entity-types
objectId: ???
description: Entity Types
---

# Entity Types {#entity-types}

Entity Types define the shape of _kinds of things_.


## Creating new entity types

HASH has a no-code Entity Type editor which you can use to create, inspect, and update your Entity Types.

### Extending existing entity types

### Defining entity types from scratch {#creating-entity-types}

Creating a new Entity Type lets you define the shape of some new data you want to use in HASH.

1.  To create a new Entity Type: click the + button on the right of “TYPES” in the left side-bar, or click the + button in the top-nav and select “Create Entity Type”.

1.  Set a name and description for your Entity Type. The name and sometimes its description will appear in lists, so it’s a good idea to make it descriptive and specific so that you and your collaborators can recognize it in the future.

1.  Click ‘Create new entity type’ to proceed to the editor. Importantly, your new Entity Type is not yet saved. Navigating away from this screen will automatically discard your draft.

1.  Click ‘Add a property type +’ to define the properties your new Entity Type’s entities can have. The Property Type window will suggest some existing Property Types you may wish to use. These are shared public Property Types. Using public Property Types can save you time and will lead to your data conforming to shared standards and definitions more closely.

1.  Type to search or to name your new property. Typing will filter the suggested Property Types, allowing you to search through them. If there isn’t a public Property Type which you can use, type a name for your new Property Type and click “Create {name} PROPERTY TYPE”.

1.  Add a description. Your new Property Type will be available for other HASH users, like the suggested ones you just saw, so a generic description which could apply to other Entity Types will work best.

1.  Set a Data Type to define the expected values. Text, Number, and Boolean Data Types are default options, but you can also define Array and Property Object Data Types by clicking to “Specify a custom expected value”. Array Data Types are lists of primitive Data values, such as a list of Text values, while Property Object Data Types are sets of other Property Types, nested within the parent Property Type you are defining. These nested Property Types can themselves allow arrays of values and be required, explained below.

1.  Click ‘Save expected value’ if defining an Array or Property Object Data Type and then ‘Create new property type’. You will see your new Property Type in the Property Types table. You’ll notice that for each of these properties, you can also choose whether to allow arrays and whether the Property Type is required. Allowing arrays means that multiple Data values can be set for this Property Type. If the Data Type itself is defined as an array, this means that multiple arrays can be set as the Data value for this Property Type. Setting a Property Type to required means Entities of this Entity Type cannot be created unless they provide a value for this Property.

1.  Click ‘Add a link type’ to define a link which can be created between Entities of this Entity Type. Like with Property Types, the Link Type window will suggest shared public Link Types you may wish to use. If you select to create a new Link Type, you’ll also need to give it a name and description.

1.  Click “Create new link type”. Back in the Link Types table, you’ll notice that the Expected Entity Type field shows “\* Anything”. This means that links of this type can be created with Entities of any type.

1.  Click “\* Anything” in the Expected Entity Types field. You’ll now see a set of suggested Entity Types which you can use to constrain this Link Type. You can’t create a new Entity Type from this interface. If you want to constraint this Link Type to an Entity Type which doesn’t exist yet, you will need to create it separately first.

1.  Click “0 or more” under Allowed number of links back on the Link Type table. This field lets you define a minimum and maximum number of links of this Link Type.

1.  Once you have added all your Property and Link Types, click “Create” in the top right corner. Your new Entity Type is now saved. No Entities of this type exist yet—jump to the Creating Entities section to add some data.


## Updating entity types {#updating-an-entity-type}

Entity Types in HASH are versioned, enabling your schemas to evolve with your knowledge. Updating an Entity Type creates a new version of that type, making it easy for you to inspect and update that type’s Entities to its new version.

1.  First, navigate to the Entity Type you wish to update. You can use the search feature under “TYPES” in the left-sidebar or scroll through the list to select it.

1.  You can make changes to the Entity Type’s Property Types and Link Types, but you cannot change its name or description.

1.  Click to ‘Add a property type’ or change whether an existing Property Type allows multiple values or is required, or click to ‘Add a link type’ or change an existing Link Type’s allowed number of links.

1.  Once you have made a change, a blue banner at the top of the screen will indicate that this Entity Type is now being edited. You’ll see the current version number of the Entity Type and the new version number and will see buttons for discarding the edits or publishing them.

1.  Click ‘Publish update’ to save your edits. Importantly, any Entities which conform to this Entity Type will not have been updated to the new version of the schema.

1.  Click the ‘Entities’ tab to view this Entity Type’s Entities. For each Entity, you’ll see its current Entity Type version in the Entity Type Version column. You’ll notice that they are all still on the previous version of the Entity Type.

1.  Click into one of those Entities and you’ll see a “Types” heading indicating that there’s a newer version of the Entity Type available. You can click the name of the Entity Type to go to its page and inspect the new version.

1.  Click the update button to update this Entity to the new Entity Type version. A modal will pop up to make sure you understand the potential consequences of this update:

    1.  If Property Types or Link Types have been removed in the new version of the Entity Type, they will be removed from this Entity, along with any Data values.
    1.  If any Property Types’ Data Types have been changed, any existing Data values which don’t conform to the new Data Type will be removed or unset.
    1.  If existing Property Types have been changed from not required to required and the Entity doesn’t have a Data value set for those Property Types, you will still be able to upgrade the Entity Type. Data values will not be set automatically and no problems occur, but you should manually add values to make sure the Entity is compliant with its Entity Type.
    1.  If the expected Entity Types or allowed number of links on any of the Link Types has been changed in the new version of the Entity Type and the Entity’s existing links don’t follow the new schema, they will be unaffected but should be updated.
    1.  If new Property Types or Links Types have been added to the new version of the Entity Type, the Entity will have those new Property and Link Types, but no Data values or Links will be created.

1.  Click ‘Update entity type’ to upgrade your Entity. You’ll notice the updated Property, Link, and Data Types are now reflected on your Entity and you can make any necessary changes so that this Entity follows its new schema.