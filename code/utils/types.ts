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
export interface LayoutConfig {
    width: number
    height: number
    direction: FlexDirection
    wrap: FlexWrap
    columns: number
    verticalAlignment: FlexAlignment
    verticalDistribution: FlexDistribution
    padding: string
}

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

// Adapters
export type FormatDataCallback = (data: any) => any
export type SortDataCallback = (
    data: any,
    sortDirection: SortDirection,
    sortKey: SortKey
) => any
export type SearchDataCallback = (data: any, searchTerm: string) => any

// Component
export interface DataComponentProps {
    // Component layout
    width: number
    height: number

    // Data props
    dataSource: DataSource
    apiUrl: string | null
    apiResponseDataKey: string | null
    airtableUrl: string | null
    airtableImageSize: AirtableImageSize
    dataSourceFileType: DataSourceFileType
    jsonFileUrl: string | null
    csvFileUrl: string | null
    tsvFileUrl: string | null

    // List items layout
    direction: FlexDirection
    verticalAlignment: FlexAlignment
    verticalDistribution: FlexDistribution
    columns: number
    gap: number
    paddingPerSide: boolean
    padding: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
    wrap: FlexWrap
    horizontalGap: number
    verticalGap: number
    listItem?: React.ReactNode
    hoverListItem?: React.ReactNode
    loadingState?: React.ReactNode
    loadingDelay: number
    emptyState?: React.ReactNode

    // Scrolling
    isScrollEnabled: boolean
    isDragScrollEnabled: boolean
    isWheelScrollEnabled: boolean

    // Search functionality
    isSearchEnabled: boolean
    searchTerm: string

    // Sorting
    shouldSort: boolean
    sortKey: SortKey
    sortDirection: SortDirection

    // Component modes
    mode: ComponentMode

    // HTTP
    overrideHttpHeaders: boolean
    httpAuthorizationHeader: string
    httpHeaders: string[]

    // Adapters
    onFormatData?: FormatDataCallback
    onSortData?: SortDataCallback
    onSearchData?: SearchDataCallback

    // Event handlers
    onItemTap: (item) => void
    onItemLongPress: (item) => void
}
