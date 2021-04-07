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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(137, 86, 255, 0.12)",
    borderRadius:
        "calc(4px * var(--framerInternalCanvas-canvasPlaceholderContentScaleFactor, 1))",
    border:
        "calc(1px * var(--framerInternalCanvas-canvasPlaceholderContentScaleFactor, 1)) dashed rgb(137, 86, 255)",
    width: "100%",
    height: "100%",

    overflow: "scroll",

    textOverflow: "ellipsis",
    textAlign: "center",
    wordWrap: "normal",
    color: "rgb(137, 86, 255)",
    fontFamily: "Inter",
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
            <h3>Connect your Smart Component</h3>
            {getCompletionStatusHint(props.isListItemConnected)} 1. Using the
            connector on the canvas or the properties panel, connect your Smart
            Component. For every row in your data, this component will be
            rendered.
            <br />
            <br />
            {getCompletionStatusHint(props.isLoadingStateConnected)} 2. Connect
            a loading state. A material spinner will be shown by default.
            <br />
            <br />
            {getCompletionStatusHint(props.isEmptyStateConnected)} 3. Connect an
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
            <h3>How are the variables in my component populated?</h3>
            Variables in Smart Components allow you to customise the values of
            specific properties. When you create a variable, you provide a name
            for it to be identified by. If you name this variable identically to
            how the fields in your data are named, it will be automatically
            populated by your data.
            <br />
            <br />
            You need to ensure that the names you assign to your variables match
            the following properties:
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
