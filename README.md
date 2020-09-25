# Framer Data Component

Drawing inspiration from the [Data Stack](https://packages.framer.com/package/fhur/data-stack) and [Airtable](https://packages.framer.com/package/aroagb/airtable) packages, the Framer Data Component allows you to seamlessly integrate data into your prototypes. By connecting a Design Component you've visually created on Framer's canvas, you can render a list of components in your prototype that are populated by a real data source.

## The Workflow

First, you need to decide your data source.

### Data Sources

| Source   |                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API      | Integrate with any HTTP API. If your API requires authentication, you can provide a custom Authorization header using the HTTP Headers property control.                                                |
| File     | Upload a JSON/CSV/TSV file. This component will take care of converting your file into a format your prototype can understand.                                                                          |
| Airtable | Connect to an Airtable base. As requests to Airtable require an API key, you need to ensure there is an `api_key` query parameter in the URL property control. We'll tell you if you don't provide one! |
|          |                                                                                                                                                                                                         |

### Connecting a Design Component

Once you've decided on your data source, you're ready to start populating your prototype with real data. You'll first need to grab the frame you want to use as your list item—this will be the component that's repeated for each item in the data you provide to your prototype. This frame needs to be a [Design Component](https://www.framer.com/support/using-framer/design-components/) so you can assign a name to the properties of your component. This allows the text layers and images within your component to be populated and overridden by the Data Component.

#### Design Component Property COntrols

For this component to function, it needs to be connected to a Design Component on Framer's canvas. When you create a Design Component, Framer will show some checkboxes in the properties panel that allow you to control which fields in your prototype can be populated. When you select these checkboxes, you also give them a name, which becomes the "variable" of that field. Providing that name matches the fields in the response from your chosen data source, Framer will populate that field with the value from the data. This works for text fields and for images too.

## Layout

The layout controls at your disposal vary depending on which direction you choose to lay elements out.

### Horizontal

Lays the items out horizontally from left to right. Preserves the original width of the connected Design Component.

| Horizontal |                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gap        | Sets the horizontal gap in pixels between elements                                                                                                    |
| Wrap       | Allows items to wrap to the next line if they do not fit within the width available. Using the Reverse option makes elements flow from right to left. |

### Vertical

Lays the items out vertically from top to bottom. The width of the connected Design Component will be resized to fill the available horizontal space or number of columns selected.

| Vertical   | (Single Column)                                  |
| ---------- | ------------------------------------------------ |
| Gap        | Sets the vertical gap in pixels between elements |
| Distribute | Controls the vertical distribution of elements   |

| Vertical | (Multiple Columns)                                 |
| -------- | -------------------------------------------------- |
| Gap (↔)  | Sets the horizontal gap in pixels between elements |
| Gap (↕)  | Sets the vertical gap in pixels between elements   |

## Empty/Loading States

In the same fashion as connecting a Design Component on the canvas, you can also connect other layers to be used as empty/loading states within your component. As your prototype is now fetching data for real, depending on the user's internet connection you may want to show a helpful loading state. If your data source returns nothing, or perhaps the user is performing a search and doesn't get any results, you can connect an empty state.

### Loading Delay

The minimum amount of time to wait before displaying data. Useful for user testing scenarios with slow internet connections

## Sort

By default, this component will not sort your data. This means the order in which your data source returns data is preserved. If you'd like more control over how it's sorted, you can enable Manual sorting. This component will take care of sorting alphabetically or numerically.

| Sorting   | (Manual)                                                                                   |
| --------- | ------------------------------------------------------------------------------------------ |
| Property  | The field in your data to sort upon                                                        |
| Direction | The direction to order elements by. Defaults to ascending, showing the lowest values first |

## Search

This component has fuzzy searching built in, allowing you to build complex searching interfaces that allow the user to approximately search for what they want. It uses the [Fuse.js](https://fusejs.io/) library to do this.

Once search is enabled, you can set a Search Query via the properties panel. In most cases, you'll probably want to leave this field blank and set your search query using Code Overrides. This [example project](https://framer.com/projects/new?duplicate=fXHamZqD4CB4e80R0Ldu) illustrates how to build a basic search interaction using Framer's built-in Input component.

## Mode

This component has 3 separate modes which can be used for guidance & troubleshooting.

| Mode    |                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------- |
| Default | The default behavior of this component                                                            |
| Help    | Displays instructions for how to connect this component to your data source                       |
| Debug   | Displays the raw JSON of your component's data. Useful when troubleshooting fields not populating |

## HTTP Headers

Working with an API that requires authentication? This component allows you to attach custom HTTP Headers which will be included in the request to your chosen data source.

| HTTP Headers  | (Custom)                                                                        |
| ------------- | ------------------------------------------------------------------------------- |
| Authorization | The HTTP Authorization header. Useful for data sources requiring authentication |

## Bugs/Questions/Improvements?

Feel free to leave questions/bugs on the [GitHub repository](https://github.com/iKettles/framer-data-component.framerfx) for this package. You can also contact me directly on Twitter [@iKettles](https://twitter.com/iKettles)
