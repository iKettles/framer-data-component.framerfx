import { ControlDescription, ControlType } from "framer"
import { DataSourceFileType, DataSource } from "./types"

export function gapControl<T>(
    title: string,
    hidden: (props: Partial<T>) => boolean
): ControlDescription<Partial<T>> {
    return {
        title,
        type: ControlType.Number,
        displayStepper: true,
        step: 2,
        min: 0,
        unit: "px",
        defaultValue: 0,
        hidden,
    }
}

export function uploadFileControl<T>(
    fileType: DataSourceFileType
): ControlDescription<Partial<T>> {
    return {
        title: indentPropertyControlTitle("File"),
        type: ControlType.File,
        allowedFileTypes: [fileType],
        hidden: (
            props: {
                dataSource: DataSource
                dataSourceFileType: DataSourceFileType
            } & Partial<T>
        ) =>
            props.dataSource !== "file" ||
            props.dataSourceFileType !== fileType,
    }
}

export function indentPropertyControlTitle(title: string) {
    return `• ${title}`
}
