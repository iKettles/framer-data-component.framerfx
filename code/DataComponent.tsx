import * as React from "react"
import { Scroll, Frame, addPropertyControls, ControlType } from "framer"
import Placeholder from "./Placeholder"
import { useConnectedComponentInstance } from "./hooks/useConnectedComponentInstance"
import { useCuratedDataSource } from "./hooks/useCuratedDataSource"
import {
    getListItemStyle,
    getListItemWidth,
    isVerticalGapControlledByContainer,
    renderContainer,
} from "./utils/layout"
import { DataComponentProps } from "./utils/types"
import {
    gapControl,
    uploadFileControl,
    indentPropertyControlTitle,
} from "./utils/propertyControls"
import { useConnectedSmartComponent } from "./hooks/useConnectedSmartComponent"

export function DataComponent(props: DataComponentProps) {
    const {
        data,
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
        httpHeaders,
        listItem,
        loadingState,
        loadingDelay,
        emptyState,
        isSearchEnabled,
        searchTerm,
        shouldSort,
        sortDirection,
        sortKey,
        columns,
        gap,
        paddingPerSide,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        wrap,
        verticalAlignment,
        verticalDistribution,
        horizontalGap,
        verticalGap,
        direction,
        mode,
        isScrollEnabled,
        isDragScrollEnabled,
        isWheelScrollEnabled,
        onItemTap,
        onItemLongPress,
        onFormatData,
        onSortData,
        onSearchData,
        ...rest
    } = props
    const [results, isLoading, errorMessage] = useCuratedDataSource(
        data,
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
        isSearchEnabled,
        searchTerm,
        shouldSort,
        sortKey,
        sortDirection,
        onFormatData,
        onSortData,
        onSearchData,
        overrideHttpHeaders && {
            parsedHeaders: {
                Authorization: httpAuthorizationHeader,
            },
            unparsedHeaders: httpHeaders,
        }
    )
    const [connectedListItemContainer, connectedListItem] =
        useConnectedSmartComponent(listItem)
    const [connectedLoadingState] = useConnectedComponentInstance(loadingState)
    const [connectedEmptyState] = useConnectedComponentInstance(emptyState)
    const resultItems = React.useMemo(() => {
        if (!connectedListItem) {
            return []
        }
        const listItemWidth = getListItemWidth(
            direction,
            rest.width,
            columns,
            horizontalGap,
            connectedListItem.props.width
        )

        return results.map((result, index) => {
            const listItemStyles = getListItemStyle(
                direction,
                gap,
                horizontalGap,
                verticalGap,
                columns,
                index,
                results.length
            )

            const resultData = Object.keys(result).reduce((acc, key) => {
                // Ensure number becomes a string — Framer will error if it receives a number as a design component override
                if (typeof result[key] === "number") {
                    acc[key] = String(result[key])
                } else {
                    acc[key] = result[key]
                }
                return acc
            }, {})

            const listItemProps = {
                key: result.id,
                id: `${result.id}-${index}`,
                ...resultData,
                style: {
                    position: "relative",
                    ...connectedListItem.props.style,
                    ...listItemStyles,
                    width: "100%",
                },
                index,
                /**
                 * We need to pseudo-randomize the layout ID to avoid elements disappearing on hover. Framer Motion
                 * expects a layoutId in the tree to be unique — if there is duplicates we'll get weird behaviour.
                 * We'll also apply this to the container below (if necessary)
                 */
                layoutId: `${connectedListItem.props.layoutId}-${index}`,
                onTap() {
                    onItemTap(result)
                },
            }

            /**
             * Connected item is a legacy design component and is not wrapped in a container.
             * We need to set the width directly, instead of via the component container like
             * we have for smart components/code components
             */
            if (!connectedListItemContainer) {
                return React.cloneElement(connectedListItem, {
                    ...listItemProps,
                    style: {
                        ...listItemProps.style,
                        width: listItemWidth,
                    },
                })
            }

            return React.cloneElement(connectedListItemContainer, {
                key: `wrapper-${result.id}`,
                style: {
                    position: "relative",
                    ...listItemStyles,
                    width: listItemWidth,
                },
                layoutId: `${connectedListItemContainer.props.layoutId}-${index}`,
                children: React.cloneElement(connectedListItem, {
                    ...listItemProps,
                }),
            })
        })
    }, [
        results,
        columns,
        gap,
        horizontalGap,
        verticalGap,
        connectedListItemContainer,
        connectedListItem,
        shouldSort,
        sortDirection,
        sortKey,
        direction,
        onItemTap,
    ])

    const containerPadding = React.useMemo(() => {
        if (paddingPerSide) {
            return `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`
        }
        return `${padding}px`
    }, [
        paddingPerSide,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
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
                isListItemConnected={!!connectedListItem}
                isEmptyStateConnected={!!connectedEmptyState}
                isLoadingStateConnected={!!connectedLoadingState}
            />
        )
    }

    if (mode === "debug") {
        return (
            <Placeholder
                {...props}
                mode={"debug"}
                results={results}
                isListItemConnected={!!connectedListItem}
                isEmptyStateConnected={!!connectedEmptyState}
                isLoadingStateConnected={!!connectedLoadingState}
            />
        )
    }

    if (!connectedListItem) {
        return (
            <Placeholder
                {...props}
                mode={"connect-list-item"}
                isListItemConnected={!!connectedListItem}
                isEmptyStateConnected={!!connectedEmptyState}
                isLoadingStateConnected={!!connectedLoadingState}
            />
        )
    }

    if (!apiUrl && !data) {
        return (
            <Placeholder
                {...props}
                mode={"api-url"}
                isListItemConnected={!!connectedListItem}
                isEmptyStateConnected={!!connectedEmptyState}
                isLoadingStateConnected={!!connectedLoadingState}
            />
        )
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
        return (
            <Placeholder
                {...props}
                mode={"loading"}
                isListItemConnected={!!connectedListItem}
                isEmptyStateConnected={!!connectedEmptyState}
                isLoadingStateConnected={!!connectedLoadingState}
            />
        )
    }

    if (resultItems.length === 0 && !!connectedEmptyState) {
        return React.cloneElement(connectedEmptyState as React.ReactElement, {
            width: rest.width,
            height: rest.height,
        })
    }

    const renderedItems = renderContainer(resultItems, {
        width: rest.width,
        height: rest.height,
        direction,
        wrap,
        columns,
        verticalAlignment,
        verticalDistribution,
        padding: containerPadding,
    })

    if (!isScrollEnabled) {
        return (
            <Frame
                background={"transparent"}
                width={"100%"}
                height={rest.height}
            >
                {renderedItems}
            </Frame>
        )
    }

    return (
        <Scroll
            direction={direction}
            width={"100%"}
            height={rest.height}
            dragEnabled={isDragScrollEnabled}
            wheelEnabled={isWheelScrollEnabled}
        >
            {renderedItems}
        </Scroll>
    )
}

DataComponent.defaultProps = {
    width: 500,
    height: 320,
    searchTerm: "",
    debug: false,
    columns: 1,
    onItemTap: (item) => {},
    onItemLongPress: (item) => {},
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
    padding: {
        title: indentPropertyControlTitle("Padding"),
        type: ControlType.FusedNumber,
        toggleKey: "paddingPerSide",
        toggleTitles: ["Padding", "Padding per side"],
        valueKeys: [
            "paddingTop",
            "paddingRight",
            "paddingBottom",
            "paddingLeft",
        ],
        valueLabels: ["T", "R", "B", "L"],
        min: 0,
    },
    horizontalGap: gapControl<DataComponentProps>(
        indentPropertyControlTitle("Gap (↔)"),
        (props) => !(props.direction === "vertical" && props.columns > 1)
    ),
    verticalGap: gapControl<DataComponentProps>(
        indentPropertyControlTitle("Gap (↕)"),
        (props) => !(props.direction === "vertical" && props.columns > 1)
    ),
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
        defaultValue: "flex-start",
        hidden: (props) => props.direction !== "vertical" || props.columns > 1,
    },
    wrap: {
        title: indentPropertyControlTitle("Wrap"),
        type: ControlType.SegmentedEnum,
        options: ["nowrap", "wrap", "wrap-reverse"],
        optionTitles: ["None", "Wrap", "Reverse"],
        defaultValue: "nowrap",
        hidden: (props) => props.direction === "vertical",
    },
    isScrollEnabled: {
        title: "Scrollable",
        type: ControlType.Boolean,
        defaultValue: true,
    },
    isDragScrollEnabled: {
        title: indentPropertyControlTitle("Drag"),
        type: ControlType.Boolean,
        defaultValue: true,
        hidden: (props) => !props.isScrollEnabled,
    },
    isWheelScrollEnabled: {
        title: indentPropertyControlTitle("Wheel"),
        type: ControlType.Boolean,
        defaultValue: true,
        hidden: (props) => !props.isScrollEnabled,
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
    isSearchEnabled: {
        title: "Search",
        type: ControlType.Boolean,
        defaultValue: false,
        enabledTitle: "Enabled",
        disabledTitle: "Disabled",
    },
    searchTerm: {
        title: indentPropertyControlTitle("Query"),
        type: ControlType.String,
        defaultValue: "",
        hidden: (props) => !props.isSearchEnabled,
    },
    mode: {
        title: "Mode",
        type: ControlType.Enum,
        options: ["default", "help", "debug"],
        optionTitles: ["Default", "Help", "Debug"],
        defaultValue: "default",
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
    httpHeaders: {
        title: indentPropertyControlTitle("HTTP Headers"),
        type: ControlType.Array,
        propertyControl: {
            type: ControlType.String,
        },
        hidden: (props) => !props.overrideHttpHeaders,
        defaultValue: [`X-API-Key: 14a96448-1ae1-4de3-94c7-6f6e828e4519`],
    },
    onItemTap: {
        type: ControlType.EventHandler,
    },
    onItemLongPress: {
        type: ControlType.EventHandler,
    },
})
