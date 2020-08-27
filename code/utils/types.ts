// Layout
export type FlexDirection = "horizontal" | "vertical"
export type FlexAlignment = "start" | "center" | "end"
export type FlexWrap = "nowrap" | "wrap" | "wrap-reverse"
export type FlexDistribution =
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly"

// Component Props
export type ComponentMode = "default" | "help" | "debug"

// Sorting
export type SortDirection = "ascending" | "descending"
export type SortKey = string | null

// Data
export type DataItem = Record<string, any>
export type DataSource = "api" | "file" | "airtable"
export type DataSourceFileType = "json" | "csv" | "tsv"
export type APIResponse = DataItem[]
export type AirtableImageSize = "small" | "large" | "medium"
export type AirtableResponse = {
    records: Array<{
        id: string
        fields: DataItem
        createdTime: string
    }>
}
export type JSONResponse = DataItem[]
export type CSVResponse = DataItem[]
