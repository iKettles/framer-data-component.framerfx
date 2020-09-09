import * as React from "react"
import {
    FlexDirection,
    FlexWrap,
    FlexAlignment,
    FlexDistribution,
} from "./types"

const containerStyle: React.CSSProperties = {
    display: "flex",
}

const verticalContainerStyle: React.CSSProperties = {
    flexDirection: "column",
}

const horizontalContainerStyle: React.CSSProperties = {
    height: "100%",
    flexDirection: "row",
}

export function getListItemStyle(
    direction: FlexDirection,
    gap: number,
    horizontalGap: number,
    verticalGap: number,
    columns: number,
    index: number,
    total: number
): React.CSSProperties {
    const styles: React.CSSProperties = {}

    const remainder = index % columns

    if (direction === "horizontal") {
        styles.marginRight = gap
    } else if (direction === "vertical") {
        if (columns > 1) {
            // Is either first item in row / not last item in row
            if (remainder === 0 || remainder !== columns - 1) {
                styles.marginRight = horizontalGap
            }

            // Is not last row
            if (index < total - columns) {
                styles.marginBottom = verticalGap
            }
        } else {
            styles.marginBottom = gap
        }
    }

    return styles
}

export function renderContainer(
    resultItems: React.ReactElement[],
    layoutConfig: {
        width: number
        height: number
        direction: FlexDirection
        wrap: FlexWrap
        columns: number
        verticalAlignment: FlexAlignment
        verticalDistribution: FlexDistribution
    }
) {
    return (
        <div
            style={{
                ...getContainerStyle(layoutConfig),
            }}
        >
            {resultItems}
        </div>
    )
}

export function getContainerStyle({
    width,
    height,
    direction,
    wrap,
    columns,
    verticalAlignment,
    verticalDistribution,
}: {
    width: number
    height: number
    direction: FlexDirection
    wrap: FlexWrap
    columns: number
    verticalAlignment: FlexAlignment
    verticalDistribution: FlexDistribution
}) {
    let styles: React.CSSProperties = {
        ...containerStyle,
        width: direction === "horizontal" ? "100%" : width,
        height,
    }

    if (direction === "vertical") {
        if (columns === 1) {
            styles = {
                ...styles,
                ...verticalContainerStyle,
                alignItems: verticalAlignment,
                justifyContent: verticalDistribution,
            }
        } else {
            styles = {
                ...styles,
                flexDirection: "row",
                flexWrap: "wrap",
            }
            delete styles.height
        }
    } else {
        styles = {
            ...styles,
            ...horizontalContainerStyle,
            flexWrap: wrap,
        }
    }

    return styles
}

export function isVerticalGapControlledByContainer(
    distribution: FlexDistribution
) {
    return (
        distribution === "space-around" ||
        distribution === "space-between" ||
        distribution === "space-evenly"
    )
}
