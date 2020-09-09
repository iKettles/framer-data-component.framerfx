import * as React from "react"
import {
    Scroll,
    addPropertyControls,
    ControlType,
    Stack,
    RenderTarget,
} from "framer"
import Placeholder from "./Placeholder"
import { useConnectedComponentInstance } from "./utils/useConnectedComponentInstance"
import { useSortedSearchResults, useDataSource } from "./utils/data"
import {
    getListItemStyle,
    getContainerStyle,
    isVerticalGapControlledByContainer,
    renderContainer,
} from "./utils/layout"
import {
    FlexWrap,
    FlexDirection,
    FlexDistribution,
    FlexAlignment,
    SortDirection,
    ComponentMode,
    DataSource,
    AirtableImageSize,
    DataSourceFileType,
    SortKey,
} from "./utils/types"
import {
    gapControl,
    uploadFileControl,
    indentPropertyControlTitle,
} from "./utils/propertyControls"
import { PreventLayoutIdGeneration } from "./LayoutIdPrevention"

export function DataComponent(props: DataComponentProps) {
    const {
        dataSource,
        apiUrl,
        apiResponseDataKey,
        airtableUrl,
        airtableImageSize,
        tsvFileUrl,
        csvFileUrl,
        jsonFileUrl,
        dataSourceFileType,
        overrideHttpHeaders,
        httpAuthorizationHeader,
        listItem,
        loadingState,
        loadingDelay,
        emptyState,
        searchTerm,
        searchKeys,
        shouldSort,
        sortDirection,
        sortKey,
        columns,
        gap,
        wrap,
        verticalAlignment,
        verticalDistribution,
        horizontalGap,
        verticalGap,
        direction,
        mode,
        onItemTap,
        onItemLongPress,
        ...rest
    } = props
    const [data, isLoading, errorMessage] = useDataSource(
        dataSource,
        dataSourceFileType,
        apiResponseDataKey,
        apiUrl,
        airtableUrl,
        tsvFileUrl,
        csvFileUrl,
        jsonFileUrl,
        airtableImageSize,
        loadingDelay,
        overrideHttpHeaders && {
            Authorization: httpAuthorizationHeader,
        }
    )
    const [results] = useSortedSearchResults(
        data,
        searchTerm,
        searchKeys,
        shouldSort,
        sortKey,
        sortDirection
    )
    const [connectedListItem] = useConnectedComponentInstance(listItem)
    const [connectedLoadingState] = useConnectedComponentInstance(loadingState)
    const [connectedEmptyState] = useConnectedComponentInstance(emptyState)
    const resultItems = React.useMemo(() => {
        if (!connectedListItem) {
            return []
        }
        return results.map((result, index) => {
            const layoutStyles = getListItemStyle(
                direction,
                gap,
                horizontalGap,
                verticalGap,
                columns,
                index,
                results.length
            )
            return React.cloneElement(connectedListItem as React.ReactElement, {
                key: index,
                width:
                    direction === "vertical"
                        ? (rest.width -
                              columns *
                                  ((layoutStyles.marginRight as
                                      | number
                                      | undefined) || 0)) /
                          columns
                        : (connectedListItem as any).props.width,
                style: {
                    position: "relative",
                    ...layoutStyles,
                },
                ...Object.keys(result).reduce((acc, key) => {
                    // Ensure value is a string
                    acc[key] = String(result[key])
                    return acc
                }, {}),
                id: `${(connectedListItem as any).props.id}—${index}`,
                onTap() {
                    onItemTap(result)
                },
            })
        })
    }, [
        results,
        columns,
        gap,
        horizontalGap,
        verticalGap,
        connectedListItem,
        direction,
        onItemTap,
    ])

    if (errorMessage) {
        return (
            <Placeholder
                {...props}
                mode={"error"}
                errorMessage={errorMessage}
            />
        )
    }

    if (mode === "help") {
        return (
            <Placeholder
                {...props}
                mode={"help"}
                results={results}
                isDesignComponentConnected={!!connectedListItem}
            />
        )
    }

    if (mode === "debug") {
        return <Placeholder mode={"debug"} results={results} />
    }

    if (!connectedListItem) {
        return <Placeholder mode={"connect-list-item"} />
    }

    if (!apiUrl) {
        return <Placeholder mode={"api-url"} />
    }

    if (isLoading) {
        if (connectedLoadingState) {
            return React.cloneElement(
                connectedLoadingState as React.ReactElement,
                {
                    width: rest.width,
                    height: rest.height,
                }
            )
        }
        return <Placeholder mode={"loading"} />
    }

    if (resultItems.length === 0 && !!connectedEmptyState) {
        return React.cloneElement(connectedEmptyState as React.ReactElement, {
            width: rest.width,
            height: rest.height,
        })
    }

    return (
        <Scroll direction={direction} width={rest.width} height={rest.height}>
            <PreventLayoutIdGeneration>
                {renderContainer(resultItems, {
                    width: rest.width,
                    height: rest.height,
                    direction,
                    wrap,
                    columns,
                    verticalAlignment,
                    verticalDistribution,
                })}
            </PreventLayoutIdGeneration>
        </Scroll>
    )
}

DataComponent.defaultProps = {
    width: 500,
    height: 320,
    searchTerm: "",
    debug: false,
    searchKeys: [],
    columns: 1,
    onItemTap: (item) => {},
    onItemLongPress: (item) => {},
}

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
    wrap: FlexWrap
    horizontalGap: number
    verticalGap: number
    listItem?: React.ReactNode
    loadingState?: React.ReactNode
    loadingDelay: number
    emptyState?: React.ReactNode

    // Search functionality
    searchTerm: string
    searchKeys: string[]

    // Sorting
    shouldSort: boolean
    sortKey: SortKey
    sortDirection: SortDirection

    // Component modes
    mode: ComponentMode

    // HTTP
    overrideHttpHeaders: boolean
    httpAuthorizationHeader: string

    // Event handlers
    onItemTap: (item) => void
    onItemLongPress: (item) => void
}

addPropertyControls(DataComponent, {
    dataSource: {
        type: ControlType.Enum,
        optionTitles: ["API", "File", "Airtable"],
        options: ["api", "file", "airtable"],
        defaultValue: "api",
    },
    dataSourceFileType: {
        title: indentPropertyControlTitle("Type"),
        type: ControlType.Enum,
        options: ["json", "csv", "tsv"],
        optionTitles: ["JSON", "CSV", "TSV"],
        hidden: (props) => props.dataSource !== "file",
    },
    jsonFileUrl: uploadFileControl<DataComponentProps>("json"),
    csvFileUrl: uploadFileControl<DataComponentProps>("csv"),
    tsvFileUrl: uploadFileControl<DataComponentProps>("tsv"),
    apiUrl: {
        title: indentPropertyControlTitle("URL"),
        type: ControlType.String,
        defaultValue: "https://reqres.in/api/users?page=1",
        hidden: (props) => props.dataSource !== "api",
    },
    apiResponseDataKey: {
        title: indentPropertyControlTitle("Data Key"),
        type: ControlType.String,
        defaultValue: "data",
        hidden: (props) => props.dataSource !== "api",
    },
    airtableUrl: {
        title: indentPropertyControlTitle("URL"),
        type: ControlType.String,
        defaultValue: "",
        hidden: (props) => props.dataSource !== "airtable",
    },
    airtableImageSize: {
        title: indentPropertyControlTitle("Image Size"),
        type: ControlType.SegmentedEnum,
        options: ["small", "large", "full"],
        optionTitles: ["S", "M", "L"],
        defaultValue: "large",
        hidden: (props) => props.dataSource !== "airtable",
    },
    direction: {
        title: "Layout",
        type: ControlType.SegmentedEnum,
        options: ["horizontal", "vertical"],
        defaultValue: "vertical",
    },
    verticalAlignment: {
        title: indentPropertyControlTitle("Align"),
        type: ControlType.SegmentedEnum,
        options: ["flex-start", "center", "flex-end"],
        optionTitles: ["Top", "Center", "Bottom"],
        defaultValue: "start",
        hidden: (props) => true,
    },
    verticalDistribution: {
        title: indentPropertyControlTitle("Distribute"),
        type: ControlType.Enum,
        optionTitles: [
            "Start",
            "Center",
            "End",
            "Space Between",
            "Space Around",
            "Space Evenly",
        ],
        options: [
            "flex-start",
            "center",
            "flex-end",
            "space-between",
            "space-around",
            "space-evenly",
        ],
        defaultValue: "space-around",
        hidden: (props) => props.direction !== "vertical" || props.columns > 1,
    },
    columns: {
        title: indentPropertyControlTitle("Columns"),
        type: ControlType.Number,
        displayStepper: true,
        step: 1,
        min: 1,
        defaultValue: 1,
        hidden: (props) => props.direction !== "vertical",
    },
    gap: gapControl<DataComponentProps>(
        indentPropertyControlTitle("Gap"),
        (props) =>
            props.direction === "vertical" &&
            (props.columns > 1 ||
                isVerticalGapControlledByContainer(props.verticalDistribution))
    ),
    horizontalGap: gapControl<DataComponentProps>(
        indentPropertyControlTitle("Gap (↔)"),
        (props) => !(props.direction === "vertical" && props.columns > 1)
    ),
    verticalGap: gapControl<DataComponentProps>(
        indentPropertyControlTitle("Gap (↕)"),
        (props) => !(props.direction === "vertical" && props.columns > 1)
    ),
    wrap: {
        title: indentPropertyControlTitle("Wrap"),
        type: ControlType.SegmentedEnum,
        options: ["nowrap", "wrap", "wrap-reverse"],
        optionTitles: ["None", "Wrap", "Reverse"],
        defaultValue: "nowrap",
        hidden: (props) => props.direction === "vertical",
    },
    listItem: {
        title: "List Item",
        type: ControlType.ComponentInstance,
    },
    loadingState: {
        title: "Loading State",
        type: ControlType.ComponentInstance,
    },
    emptyState: {
        title: "Empty State",
        type: ControlType.ComponentInstance,
    },
    loadingDelay: {
        title: "Loading Delay",
        type: ControlType.Number,
        min: 0,
        defaultValue: 0,
        displayStepper: true,
        step: 0.5,
        unit: "s",
    },
    shouldSort: {
        title: "Sort",
        type: ControlType.Boolean,
        enabledTitle: "Manual",
        disabledTitle: "Default",
        defaultValue: false,
    },
    sortKey: {
        title: indentPropertyControlTitle("Property"),
        type: ControlType.String,
        defaultValue: "price",
        hidden: (props) => !props.shouldSort,
    },
    sortDirection: {
        title: indentPropertyControlTitle("Direction"),
        type: ControlType.SegmentedEnum,
        options: ["ascending", "descending"],
        optionTitles: ["↑", "↓"],
        hidden: (props) => !props.shouldSort,
    },
    mode: {
        title: "Mode",
        type: ControlType.Enum,
        options: ["default", "help", "debug"],
        optionTitles: ["Default", "Help", "Debug"],
        defaultValue: "default",
    },
    searchTerm: {
        title: "Search Term",
        type: ControlType.String,
        defaultValue: "",
    },
    overrideHttpHeaders: {
        title: "HTTP Headers",
        type: ControlType.Boolean,
        enabledTitle: "Custom",
        disabledTitle: "Default",
        defaultValue: false,
    },
    httpAuthorizationHeader: {
        title: indentPropertyControlTitle("Authorization"),
        type: ControlType.String,
        hidden: (props) => !props.overrideHttpHeaders,
    },
    onItemTap: {
        type: ControlType.EventHandler,
    },
    onItemLongPress: {
        type: ControlType.EventHandler,
    },
})
