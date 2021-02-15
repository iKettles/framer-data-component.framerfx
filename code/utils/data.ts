import {
    AirtableImageSize,
    DataItem,
    DataSource,
    DataSourceFileType,
} from "./types"
import { camelCase } from "lodash"

export function normalizeAirtableFields(
    fields: DataItem,
    imageSize: AirtableImageSize
) {
    return Object.keys(fields).reduce<DataItem>((acc, key) => {
        const value = fields[key]

        if (
            Array.isArray(value) &&
            value.length > 0 &&
            typeof value[0] === "object" &&
            // This is an image field
            value[0].thumbnails &&
            value[0].thumbnails[imageSize]
        ) {
            // If there is a photo field, extract the first photo's URL using the specified image size
            acc[key] = value[0]["thumbnails"][imageSize]["url"]
        } else {
            acc[key] = value
        }

        return acc
    }, {})
}

export function getDataSourceUrl(
    dataSource: DataSource,
    dataSourceFileType: DataSourceFileType,
    urls: {
        api: string | null
        airtable: string | null
        tsv: string | null
        csv: string | null
        json: string | null
    }
) {
    if (dataSource === "api") {
        return urls.api
    } else if (dataSource === "airtable") {
        return urls.airtable
    } else if (dataSource === "file") {
        switch (dataSourceFileType) {
            case "csv":
                return urls.csv
            case "tsv":
                return urls.tsv
            case "json":
                return urls.json
            default:
                throw new Error(`Unsupported file type: ${dataSourceFileType}`)
        }
    }
}

export function formatDataSourceTitle(dataSource: DataSource) {
    if (dataSource === "api") {
        return dataSource.toUpperCase()
    }

    return dataSource.replace(/\w\S*/g, (txt: string) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

export function formatFileTypeTitle(dataSourceFileType: DataSourceFileType) {
    return dataSourceFileType.toUpperCase()
}

/**
 * Sanitizes a string to ensure it is compatible with Smart Component variables and forces it to be camelCase.
 *
 * @param name The string to sanitize
 */
export function sanitizePropertyName(name: string | null) {
    return camelCase(name)
}
