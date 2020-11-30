import * as React from "react"
import { Loading } from "@framer/framer.default/code/Loading"
import {
    getDataSourceUrl,
    formatDataSourceTitle,
    formatFileTypeTitle,
} from "./utils/data"
import { AUTH_ERROR_MESSAGE } from "./utils/errors"
import { DataSource } from "./utils/types"

const instructionsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    textAlign: "center",
    border: "1px dashed #8855ff",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#fff",
    backgroundColor: "rgba(107, 87, 152, 0.8)",
    padding: 16,
    overflow: "scroll",
}

const errorStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    fontSize: 32,
    fontWeight: 500,
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#c20000",
    border: "4px solid #9E0000",
    padding: 16,
    overflow: "hidden",
}

const loadingContainerStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: "2em",
}

const codeStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontFamily: "Menlo",
}

// @TODO Use more specific types
type PlaceholderProps = any

function getCompletionStatusHint(condition: boolean) {
    return condition ? `✅` : `❌`
}

function DataSourceHints(props) {
    const dataSourceUrl = getDataSourceUrl(
        props.dataSource,
        props.dataSourceFileType,
        {
            api: props.apiUrl,
            airtable: props.airtableUrl,
            json: props.jsonUrl,
            csv: props.csvUrl,
            tsv: props.tsvUrl,
        }
    )

    let connectDataSourceHint = ""

    if (props.dataSource === "api" || props.dataSource === "airtable") {
        connectDataSourceHint = `${getCompletionStatusHint(
            !!dataSourceUrl
        )} Enter an ${formatDataSourceTitle(props.dataSource)} URL`
    } else if (props.dataSource === "file") {
        connectDataSourceHint = `${getCompletionStatusHint(
            !!dataSourceUrl
        )} Add a ${formatFileTypeTitle(props.dataSourceFileType)} file`
    }

    return (
        <>
            <h3>Connect to your data source</h3>
            {connectDataSourceHint}
        </>
    )
}

function ConnectDesignComponentHints(props) {
    return (
        <>
            <h3>Connect your UI</h3>
            {getCompletionStatusHint(props.isListItemConnected)} 1. Connect this
            component to your list item component <br />
            <br />
            {getCompletionStatusHint(props.isHoverListItemConnected)} 2. Need a
            hover state? Connect to the layer you want to be shown for the hover
            state. We'll automatically show it when that list item is being
            hovered.
            <br />
            <br />
            {getCompletionStatusHint(props.isLoadingStateConnected)} 3. Connect
            a loading state. A material spinner will be shown by default.
            <br />
            <br />
            {getCompletionStatusHint(props.isEmptyStateConnected)} 4. Connect an
            empty state. This will be displayed if no data is returned, or a
            search yields no results.
            <DesignComponentKeyHints results={props.results} />
        </>
    )
}

function DesignComponentKeyHints(props) {
    if (!props.results || !props.results.length) {
        return null
    }
    return (
        <>
            <h3>How are the fields in my component populated?</h3>
            When you create a design component, Framer will automatically
            recognise both text and image layers within that component. You'll
            see some checkboxes next to these fields in the properties panel.
            check these boxes to allow those values to be populated by this
            component.
            <br />
            <br />
            The text box for each field allows you to set a "variable" for that
            field. You need to ensure that the names you give match the
            following properties:
            <br />
            <br />
            {Object.keys(props.results[0]).map((key) => (
                <b key={key}>{key}</b>
            ))}
        </>
    )
}

function displayErrorMessage(message: string, dataSource: DataSource): string {
    if (message === AUTH_ERROR_MESSAGE && dataSource === "airtable") {
        return `Authentication Error: Double check your Airtable API Key`
    }
    return message
}

function Placeholder(props: PlaceholderProps) {
    if (props.mode === "error") {
        return (
            <div style={errorStyle}>
                <br />
                {displayErrorMessage(props.errorMessage, props.dataSource)}
                <br />
            </div>
        )
    }
    if (props.mode === "debug") {
        return (
            <div
                style={{
                    ...instructionsStyle,
                    textAlign: "left",
                    display: "block",
                    overflow: "scroll",
                }}
            >
                <pre style={codeStyle}>
                    {JSON.stringify(props.results, null, 2)}
                </pre>
            </div>
        )
    }
    if (props.mode === "api-url") {
        return (
            <div style={instructionsStyle}>
                <br />
                Add an API URL in the property controls
                <br />
            </div>
        )
    }

    if (props.mode === "connect-list-item") {
        return (
            <div style={instructionsStyle}>
                <ConnectDesignComponentHints {...props} />
            </div>
        )
    }

    if (props.mode === "help") {
        return (
            <div style={instructionsStyle}>
                <DataSourceHints {...props} />
                <ConnectDesignComponentHints {...props} />
            </div>
        )
    }

    if (props.mode === "loading") {
        return (
            <div style={loadingContainerStyle}>
                <div style={{ width: 32, height: 32 }}>
                    <Loading
                        indicator={"Material"}
                        hasDuration={false}
                        color={"#888"}
                        fadeOut={true}
                    />
                </div>
            </div>
        )
    }

    return undefined
}

export default Placeholder
