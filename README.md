# Framer Data Component

Drawing inspiration from the [Data Stack](https://packages.framer.com/package/fhur/data-stack) and [Airtable](https://packages.framer.com/package/aroagb/airtable) packages, the Framer Data Component allows you to seamlessly integrate data into your prototypes. By connecting a [Smart Component](https://www.framer.com/blog/posts/announcing-smart-components/) you've built in Framer, you can render a list of components in your prototype that are populated by a real data source.

## Breaking Changes

This component will be overhauled soon to make best use of Framer's new features. This will mean the property controls will be rewritten to be more friendly and powerful, as well as the removal of properties such as the hover state, as Framer supports this natively. This will be a breaking change for any projects which use the Data Component. If you have any concerns over this, please message me on [Twitter](https://twitter.com/iKettles) and I will let you know when the update is released. I'm also happy to guide you through this migration.

## The Workflow

First, you need to decide your data source.

### Data Sources

| Source   |                                                                                |
| -------- | ------------------------------------------------------------------------------ |
| API      | Connect to an API. Need authentication? Use the HTTP Headers property control. |
| File     | Upload a JSON/CSV/TSV file. We'll convert it into machine-speak.               |
| Airtable | Connect to Airtable. Make sure an api_key query parameter appears in your URL. |

### Need more control?

If you're prototyping for a very specific use case, you may find the out of the box features with this component insufficient. Whilst we do our best to solve a wide array of use cases, you may find it easier to write your own adapter. This will give you more control over how data is formatted/searched/sorted whilst still relying on the functionality that comes with the component itself.

#### Creating a custom adapter

Dealing with a deeply nested data structure and wondering how to map those values to the fields in your components? Maybe you want more control over how sorting/searching is handled? You probably want a custom adapter that gives you full control over this. Don't worry, it's pretty easy to build! [Click here](https://framer.com/projects/new?duplicate=fXHamZqD4CB4e80R0Ldu) to open the example project in Framer Web and check out Example 6.

### Connecting a Smart Component

Once you've decided on your data source, you're ready to start populating your prototype with real data. You'll first need to grab the component you want to use as your list item—this will be the component that's repeated for each item in the list of data you provide. The component you connect can be a Code Component from a package/within your project, or one of Framer's [Smart Components](https://www.framer.com/blog/posts/announcing-smart-components/).

#### Populating your data

Smart Components use [Variables](https://www.framer.com/support/using-framer/variables/) and Code Components use [Property Controls](https://www.framer.com/support/using-framer/property-control-code-component/). These are both ways to configure how your component looks and functions, allowing you to create a generic component that can be configured wherever it's used. The naming of your Variables/Property Controls is important—these names need to match fields in your data for them to be populated correctly. Framer always uses camelCase, meaning a Variable called `First Name` will be referenced as `firstName`. The same goes for the fields in your data, if your [response](https://reqres.in/api/users?page=1) contains a field called `first_name`, it will be automatically transformed into `firstName`. You can use the Help mode in this component to determine what you should name your Variables/Property Control;s.

## Layout

The layout controls at your disposal vary depending on which direction you choose to lay elements out.

### Horizontal

Lays the items out horizontally from left to right. Preserves the original width of the connected component.

| Horizontal |                                                                             |
| ---------- | --------------------------------------------------------------------------- |
| Gap        | Sets the horizontal gap in pixels between elements                          |
| Wrap       | Items will wrap. The Reverse option makes elements flow from right to left. |

### Vertical

Lays the items out vertically from top to bottom. The width of the connected component will be resized to fill the available horizontal space or number of columns selected.

| Vertical   | (Single Column)                                  |
| ---------- | ------------------------------------------------ |
| Gap        | Sets the vertical gap in pixels between elements |
| Distribute | Controls the vertical distribution of elements   |

| Vertical | (Multiple Columns)                                 |
| -------- | -------------------------------------------------- |
| Gap (↔)  | Sets the horizontal gap in pixels between elements |
| Gap (↕)  | Sets the vertical gap in pixels between elements   |

## Scrolling

Using Framer's [Scroll](https://www.framer.com/api/scroll/) component, you can easily add a native feeling scroll interface to your prototype.

| Scrolling    |                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------- |
| Scrollable   | Whether the component is scrollable. The scrolling direction is inherited from the layout direction |
| Drag scroll  | Enables/disables drag scrolling with built-in momentum and overdrag                                 |
| Wheel scroll | Enables/disables scrolling with the mouse wheel                                                     |

## Empty/Loading States

In the same fashion as connecting a component on the canvas, you can also connect other layers to be used as empty/loading states within your component. As your prototype is now fetching data for real, depending on the user's internet connection you may want to show a helpful loading state. If your data source returns nothing, or perhaps the user is performing a search and doesn't get any results, you can connect an empty state.

### Loading Delay

The minimum amount of time to wait before displaying data. Useful for user testing scenarios with slow internet connections

## Sort

By default, this component will not sort your data. This means the order in which your data source returns data is preserved. If you'd like more control over how it's sorted, you can enable Manual sorting. This component will take care of sorting alphabetically or numerically.

| Sorting                | (Manual)                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| Property               | The field in your data to sort on                                        |
| Direction              | The direction to order elements by. Defaults to ascending (lowest first) |

## Search

This component has fuzzy searching built in, allowing you to build complex searching interfaces that allow the user to approximately search for what they want. It uses the [Fuse.js](https://fusejs.io/) library to do this.

Once search is enabled, you can set a Search Query via the properties panel. In most cases, you'll probably want to leave this field blank and set your search query using Code Overrides. This [example project](https://framer.com/projects/new?duplicate=fXHamZqD4CB4e80R0Ldu) illustrates how to build a basic search interaction using Framer's built-in Input component.

## Mode

This component has 3 separate modes which can be used for guidance & troubleshooting.

| Mode    |                                                                    |
| ------- | ------------------------------------------------------------------ |
| Default | The default behavior of this component                             |
| Help    | Instructions for how to connect this component to your data source |
| Debug   | Displays the raw JSON of your data. Useful during troubleshooting  |

## HTTP Headers

Working with an API that requires authentication? This component allows you to attach custom HTTP Headers which will be included in the request to your chosen data source.

| HTTP Headers  | (Custom)                                              |
| ------------- | ----------------------------------------------------- |
| Authorization | The HTTP Authorization header included in the request |
| HTTP Headers  | A list of HTTP headers in the format `Key: Value`     |

## Bugs/Questions/Improvements?

Feel free to leave questions/bugs on the [GitHub repository](https://github.com/iKettles/framer-data-component.framerfx) for this package. You can also contact me directly on Twitter [@iKettles](https://twitter.com/iKettles)

## Latest Release

### **1.40.0 - 04/05/2020**

- A loading state will no longer be shown when overriding the `data` property unless a `loadingDelay` property has been provided.

## Previous Releases

### **1.39.0 - 04/05/2020**

- You can now provide the property `data` via a Code Override or a Code Component. This allows you to connect the Data Component to arrays of data within your project, rather than needing to connect to an API/a file.

### **1.38.0 - 04/05/2020**

- The Distribute property now defaults to Start

### **1.37.0 - 21/04/2020**

- Remove Hover List Item functionality
- Fixed a variety of layout issues with Smart Components in different circumstances

### **1.36.0 - 30/03/2020**

- Fix width of list item not being set correctly

### **1.32.0 - 24/02/2020**

- Improved search ranking in Framer's Insert Menu

### **1.31.0 - 18/02/2020**

- Add support for targeting nested keys in the response
- Add support for Framer Smart Components

### **1.30.0 - 30/11/2020**

- Fixed objects/array types from Airtable being omitted from the response
- Fixed IDs from Airtable records being overwritten by an auto-generated ID
- Removed an unnecessary console.log

### **1.29.0 - 10/11/2020**

- Added support for applying padding to the container that wraps list items
- Fixed a bug that caused multiple columns to not render correctly when a hover state was being used
- Fixed a duplicate key error when using a hover state
- Added a small performance improvement when calculating the width of a list item

### **1.28.0 - 05/11/2020**

- Added a Hover List Item property control, allowing you to attach a hover state to your prototype.
- Improved documentation and guidance on the canvas
- The Material loading indicator from Framer's Default Components is now used as the default loading state.

### **1.27.0 - 30/10/2020**

- Fixes the component not having a fluid width when used with the responsive preview mode in Framer

### **1.26.0 - 26/10/2020**

- Added support for a custom adapter that allows you to override the behavior of searching, sorting and formatting your data.

### **1.25.0 - 20/10/2020**

- The index of the result in the list is now automatically passed to the rendered component

### **1.24.0 - 19/10/2020**

- Ensure nested objects in a connected data source does not get converted to a string

### **1.23.0 - 19/10/2020**

- Fix an error that could be thrown when using a nested data struecture

### **1.22.0 - 15/10/2020**

- Add alphabetical sorting

### **1.21.0 - 06/10/2020**

- Add support for custom HTTP headers

### **1.20.0 - 06/10/2020**

- Initial release
