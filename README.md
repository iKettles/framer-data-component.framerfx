# Framer Data Component

Drawing inspiration from the [Data Stack](https://packages.framer.com/package/fhur/data-stack) and [Airtable](https://packages.framer.com/package/aroagb/airtable) packages, the Framer Data Component allows you to integrate data into your prototypes. By connecting a Design Component you've visually created on Framer's canvas, you can render a list of components in your prototype that are populated from a real data source

## Data Sources

Out of the box, this package supports the following data sources:

### API

Integrate with any HTTP API. Attach a custom Authorization header using the HTTP Headers property control

#### Data Key Property Control

If your API returns your data within an object, you can use this property control to indicate what key on that object contains your list of data

### File

Supports uploaded JSON/CSV/TSV files

### Airtable

Connect to an Airtable sheet. As requests to Airtable require an API key to make sure it's you, you need to ensure there is an `api_key` query parameter in the URL property control

#### Image Size

The default image size that should be used when rendering components. Defaults to M (medium), if your prototype contains many images consider switching this to S (small)

### Google Sheets

Coming soon!

## Layout

This component provides various different layout options for rendering your list of data

### Horizontal

Lay the items out horizontally from left to right

#### Gap

Sets the horizontal gap between elements

#### Wrap

Allows items to wrap to the next line if they do not fit within the width available. Using the `Reverse` option makes elements flow from right to left.

### Vertical

Lay the items out vertically from top to bottom. The width of all items will be resized to fill the available horizontal space

#### Distribution

Control the vertical distribution of list items

#### Columns

The number of columns of data to render

#### Gap

The vertical gap between list items

#### Gap (←)

When using more than 1 column, the horizontal gap between the columns

#### Gap (↓)

When using more than 1 column, the vertical gap between rows

## List Item

This is the component on Framer's canvas you want to be rendered as part of the list. You can use a Code Component if the component accepts properties with the same names as your data. If using a Design Component, you need to setup the Overrides to allow Framer to populate the fields.

### Design Component Overrides

For this component to function, it needs to be connected to a Design Component on Framer's canvas. When you create a Design Component, Framer will show some checkboxes in the properties panel that allow you to control which fields in your prototype can be populated. When you select these checkboxes, you also give them a name, which becomes the "variable" of that field. Providing that name matches the keys in the response from your chosen data source, Framer will populate that field with the value from the data. This works for text fields and for images too.

## Loading State

The component to display when the data is loading

## Empty State

The component to display when no results are returned

## Loading Delay

The minimum amount of time to wait before displaying data. Useful for user testing scenarios with slow internet connections
