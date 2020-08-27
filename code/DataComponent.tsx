import * as React from "react"
import {
    Scroll,
    addPropertyControls,
    ControlType,
    Stack,
    RenderTarget,
} from "framer"
import Placeholder from "./Placeholder"
import { useConnectedListItem } from "./utils/useConnectedListItem"
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
        listItem,
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
    const [data, isLoading] = useDataSource(
        dataSource,
        dataSourceFileType,
        apiResponseDataKey,
        apiUrl,
        airtableUrl,
        tsvFileUrl,
        csvFileUrl,
        jsonFileUrl,
        airtableImageSize
    )
    const [results] = useSortedSearchResults(
        data,
        searchTerm,
        searchKeys,
        shouldSort,
        sortKey,
        sortDirection
    )
    const [connectedListItem] = useConnectedListItem(listItem)
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
                ...result,
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
    ])

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
        return <Placeholder mode={"loading"} />
    }

    return (
        <Scroll direction={direction} width={rest.width} height={rest.height}>
            {renderContainer(resultItems, {
                width: rest.width,
                height: rest.height,
                direction,
                wrap,
                columns,
                verticalAlignment,
                verticalDistribution,
            })}
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

    // Search functionality
    searchTerm: string
    searchKeys: string[]

    // Sorting
    shouldSort: boolean
    sortKey: SortKey
    sortDirection: SortDirection

    // Component modes
    mode: ComponentMode

    // Event handlers
    onItemTap: (item) => void
    onItemLongPress: (item) => void
}

addPropertyControls(DataComponent, {
    dataSource: {
        type: ControlType.SegmentedEnum,
        optionTitles: ["API", "File", "Airtable"],
        options: ["api", "file", "airtable"],
        defaultValue: "api",
    },
    dataSourceFileType: {
        title: "↳ Type",
        type: ControlType.SegmentedEnum,
        options: ["json", "csv", "tsv"],
        optionTitles: ["JSON", "CSV", "TSV"],
        hidden: (props) => props.dataSource !== "file",
    },
    jsonFileUrl: {
        title: "↳ File",
        type: ControlType.File,
        allowedFileTypes: ["json"],
        hidden: (props) =>
            props.dataSource !== "file" || props.dataSourceFileType !== "json",
    },
    csvFileUrl: {
        title: "↳ File",
        type: ControlType.File,
        allowedFileTypes: ["csv"],
        hidden: (props) =>
            props.dataSource !== "file" || props.dataSourceFileType !== "csv",
    },
    tsvFileUrl: {
        title: "↳ File",
        type: ControlType.File,
        allowedFileTypes: ["tsv"],
        hidden: (props) =>
            props.dataSource !== "file" || props.dataSourceFileType !== "tsv",
    },
    apiUrl: {
        title: "↳ URL",
        type: ControlType.String,
        defaultValue: "https://reqres.in/api/users?page=1",
        hidden: (props) => props.dataSource !== "api",
    },
    apiResponseDataKey: {
        title: "↳ Data Key",
        type: ControlType.String,
        defaultValue: "data",
        hidden: (props) => props.dataSource !== "api",
    },
    airtableUrl: {
        title: "↳ URL",
        type: ControlType.String,
        defaultValue:
            "https://api.airtable.com/v0/appJuy4S2EAMijkNg/Colors?api_key=keyQL4Up7cLcFgVUs",
        hidden: (props) => props.dataSource !== "airtable",
    },
    airtableImageSize: {
        title: "↳ Image Size",
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
        title: "↳ Align",
        type: ControlType.SegmentedEnum,
        options: ["flex-start", "center", "flex-end"],
        optionTitles: ["Top", "Center", "Bottom"],
        defaultValue: "start",
        hidden: (props) => props.direction !== "horizontal",
    },
    verticalDistribution: {
        title: "↳ Distribute",
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
        title: "↳ Columns",
        type: ControlType.Number,
        displayStepper: true,
        step: 1,
        min: 1,
        defaultValue: 1,
        hidden: (props) => props.direction !== "vertical",
    },
    gap: {
        title: "↳ Gap",
        type: ControlType.Number,
        displayStepper: true,
        step: 2,
        min: 0,
        defaultValue: 0,
        hidden: (props) =>
            props.direction === "vertical" &&
            (props.columns > 1 ||
                isVerticalGapControlledByContainer(props.verticalDistribution)),
    },
    wrap: {
        title: "↳ Wrap",
        type: ControlType.SegmentedEnum,
        options: ["no-wrap", "wrap", "wrap-reverse"],
        optionTitles: ["None", "Wrap", "Reverse"],
        defaultValue: "no-wrap",
        hidden: (props) => props.direction === "vertical",
    },
    horizontalGap: {
        title: "↳ Gap (←)",
        type: ControlType.Number,
        displayStepper: true,
        step: 2,
        min: 0,
        defaultValue: 0,
        hidden: (props) =>
            !(props.direction === "vertical" && props.columns > 1),
    },
    verticalGap: {
        title: "↳ Gap (↓)",
        type: ControlType.Number,
        displayStepper: true,
        step: 2,
        min: 0,
        defaultValue: 0,
        hidden: (props) =>
            !(props.direction === "vertical" && props.columns > 1),
    },
    listItem: {
        title: "List Item",
        type: ControlType.ComponentInstance,
    },
    shouldSort: {
        title: "Sort",
        type: ControlType.Boolean,
        enabledTitle: "Manual",
        disabledTitle: "Default",
        defaultValue: false,
    },
    sortKey: {
        title: "↳ Property",
        type: ControlType.String,
        defaultValue: "price",
        hidden: (props) => !props.shouldSort,
    },
    sortDirection: {
        title: "↳ Direction",
        type: ControlType.SegmentedEnum,
        options: ["ascending", "descending"],
        optionTitles: ["↑", "↓"],
        hidden: (props) => !props.shouldSort,
    },
    mode: {
        title: "Mode",
        type: ControlType.SegmentedEnum,
        options: ["default", "help", "debug"],
        optionTitles: ["Default", "Help", "Debug"],
        defaultValue: "default",
    },
    onItemTap: {
        type: ControlType.EventHandler,
    },
    onItemLongPress: {
        type: ControlType.EventHandler,
    },
})
