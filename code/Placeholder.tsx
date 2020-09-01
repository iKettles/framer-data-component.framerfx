import * as React from "react"
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
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    fontSize: 13,
    fontWeight: 500,
    textAlign: "center",
    color: "#bb88ff",
    backgroundColor: "#2f2546",
    border: "4px solid #8855ff",
    padding: 16,
    overflow: "hidden",
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

function ConnectDesignComponentHints(props) {
    return (
        <>
            <br />
            Connect this component to a design component using either the
            properties panel or the connector on the right side of this
            component.
            <br />
            <br />
            Once you've connected a design component it will be used as the list
            item when this component renders a list of data.
            <br />
            <br />
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
            When you create a design component, Framer will automatically
            recognise both text and image layers within that component. You'll
            see some checkboxes next to these fields in the properties panel,
            check these boxes to allow those values to be populated by this
            component. The text box for each field allows you to set a name to
            give this field. You need to ensure that the names you give match
            the following properties:
            <br />
            <br />
            {Object.keys(props.results[0]).map((key) => (
                <div key={key}>{key}</div>
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
            <pre style={codeStyle}>
                {JSON.stringify(props.results, null, 2)}
            </pre>
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
                <ConnectDesignComponentHints results={props.results} />
            </div>
        )
    }

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

    if (props.mode === "help") {
        return (
            <div style={instructionsStyle}>
                <br />
                {props.isDesignComponentConnected ? (
                    `✅ Connect a design component`
                ) : (
                    <ConnectDesignComponentHints results={props.results} />
                )}
                <br />
                {props.dataSource === "api" || props.dataSource === "airtable"
                    ? `${
                          dataSourceUrl ? "✅" : "❌"
                      } Enter an ${formatDataSourceTitle(props.dataSource)} URL`
                    : `${
                          dataSourceUrl ? "✅" : "❌"
                      } Add a ${formatFileTypeTitle(
                          props.dataSourceFileType
                      )} file`}
                <br />
                <br />
                <DesignComponentKeyHints results={props.results} />
            </div>
        )
    }

    if (props.mode === "loading") {
        return <div style={loadingContainerStyle}>{"..."}</div>
    }

    return undefined
}

export default Placeholder
