import * as React from "react"
import { Scroll, addPropertyControls, ControlType, RenderTarget } from "framer"
import Placeholder from "./Placeholder"
import { useConnectedListItem } from "./utils/useConnectedListItem"
import {
    useSortedSearchResults,
    DataSource,
    DataSourceFileType,
    useDataSource,
    AirtableImageSize,
} from "./utils/data"

const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    height: "100%",
}

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
            return React.cloneElement(connectedListItem as React.ReactElement, {
                key: index,
                width: rest.width / columns,
                style: {
                    position: "relative",
                },
                ...result,
            })
        })
    }, [results, columns, connectedListItem])

    if (mode === "help") {
        return (
            <Placeholder
                mode={"help"}
                results={results}
                dataSource={dataSource}
                isDesignComponentConnected={!!connectedListItem}
                {...props}
            />
        )
    }

    if (!connectedListItem) {
        return <Placeholder mode={"connect-list-item"} />
    }

    if (mode === "debug") {
        return <Placeholder mode={"debug"} results={results} />
    }

    if (!apiUrl) {
        return <Placeholder mode={"api-url"} />
    }

    if (isLoading) {
        return <Placeholder mode={"loading"} />
    }

    return (
        <Scroll direction={"vertical"} width={rest.width} height={rest.height}>
            <div style={{ ...containerStyle, width: rest.width }}>
                {resultItems}
            </div>
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
    width: number
    height: number
    dataSource: DataSource
    apiUrl: string | null
    apiResponseDataKey: string | null
    airtableUrl: string | null
    airtableImageSize: AirtableImageSize
    dataSourceFileType: DataSourceFileType
    jsonFileUrl: string | null
    csvFileUrl: string | null
    tsvFileUrl: string | null

    direction: "horizontal" | "vertical"
    columns: number
    listItem?: React.ReactNode

    searchTerm: string
    searchKeys: string[]

    shouldSort: boolean
    sortKey: string | null
    sortDirection: "ascending" | "descending"

    mode: "default" | "help" | "debug"

    onItemTap: (item) => void
    onItemLongPress: (item) => void
}

// Learn more: https://framer.com/api/property-controls/
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
    columns: {
        title: "Columns",
        type: ControlType.Number,
        displayStepper: true,
        step: 1,
        min: 1,
        defaultValue: 1,
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
