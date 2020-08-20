import * as React from "react"
import Fuse from "fuse.js"
import * as Papa from "papaparse"

export type DataItem = Record<string, any>
export type DataSource = "api" | "file" | "airtable"
export type DataSourceFileType = "json" | "csv" | "tsv"
export type APIResponse = DataItem[]
export type AirtableImageSize = "small" | "large" | "medium"
export type AirtableResponse = {
    records: Array<{
        id: string
        fields: DataItem
        createdTime: string
    }>
}
export type JSONResponse = DataItem[]
export type CSVResponse = DataItem[]

export function useDataSource(
    dataSource: DataSource,
    dataSourceFileType: DataSourceFileType,
    apiResponseDataKey: string | null,
    apiUrl: string | null,
    airtableUrl: string | null,
    tsvUrl: string | null,
    csvUrl: string | null,
    jsonUrl: string | null,
    airtableImageSize: AirtableImageSize
): [any[], boolean, string | null] {
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [data, setData] = React.useState([])

    // const fetchData = (url: string, source: DataSource, sourceFileType: DataSourceFileType) {

    // }

    React.useEffect(() => {
        ;(async () => {
            try {
                const url = getDataSourceUrl(dataSource, dataSourceFileType, {
                    api: apiUrl,
                    airtable: airtableUrl,
                    tsv: tsvUrl,
                    csv: csvUrl,
                    json: jsonUrl,
                })

                if (!url) {
                    return
                }

                setIsLoading(true)

                const response = await fetch(url)
                const body = await parseResponse(
                    response,
                    dataSource,
                    dataSourceFileType,
                    apiResponseDataKey,
                    airtableImageSize
                )
                setData(
                    body.map((item, index) => ({
                        id: item.id || index,
                        ...item,
                    }))
                )
                setErrorMessage(null)
            } catch (err) {
                setErrorMessage(err.message)
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        })()
    }, [
        dataSource,
        dataSourceFileType,
        apiResponseDataKey,

        apiUrl,
        airtableUrl,
        tsvUrl,
        csvUrl,
        jsonUrl,

        airtableImageSize,
    ])

    return [data, isLoading, errorMessage]
}

export function useSortedSearchResults(
    data: Array<Record<any, any>>,
    searchTerm: string | null,
    searchKeys: string[],
    shouldSort: boolean,
    sortKey: string,
    sortDirection: "ascending" | "descending"
) {
    const fuse = React.useMemo(() => {
        return new Fuse(data, {
            includeScore: true,
            keys: searchKeys,
        })
    }, [data])

    const results = React.useMemo(() => {
        return (searchTerm
            ? fuse.search(searchTerm).map((result) => result.item)
            : data
        ).sort((a, b) => {
            if (!shouldSort) {
                return 0
            }

            // @TODO implement alphanumeric sorting

            return 0
        })
    }, [fuse, searchTerm, shouldSort, sortKey, sortDirection])

    return [results]
}

async function parseResponse(
    response: Response,
    dataSource: DataSource,
    dataSourceFileType: DataSourceFileType,
    apiResponseDataKey: string | null,
    airtableImageSize: AirtableImageSize
): Promise<DataItem[]> {
    if (dataSource === "api") {
        const body = await response.json()
        if (!apiResponseDataKey) {
            return body as APIResponse
        } else if (!body[apiResponseDataKey]) {
            throw new Error(
                `Data key ${apiResponseDataKey} doesn't exist on response body`
            )
        }
        return body[apiResponseDataKey] as APIResponse
    }
    if (dataSource === "airtable") {
        // @TODO normalize airtable fields
        return ((await response.json()) as AirtableResponse).records.map(
            (record) => {
                return normalizeAirtableFields(record.fields, airtableImageSize)
            }
        )
    }
    if (dataSource === "file") {
        if (dataSourceFileType === "json") {
            return (await response.json()) as JSONResponse
        }
        if (dataSourceFileType === "csv") {
            const parseResponse = Papa.parse(await response.text())
            if (parseResponse.errors.length) {
                throw new Error(
                    `Failed to parse CSV: ${parseResponse.errors[0].code} ${parseResponse.errors[0].message}`
                )
            }
            return parseResponse.data as CSVResponse
        }

        // @TODO implement TSV support
    }

    throw new Error(
        `Unknown data source or file type: ${dataSource} / ${dataSourceFileType}`
    )
}

function normalizeAirtableFields(
    fields: DataItem,
    imageSize: AirtableImageSize
) {
    return Object.keys(fields).reduce<DataItem>((acc, key) => {
        const value = fields[key]

        console.log("VALUE ", value)

        // string fields are passed as-is
        if (typeof value === "string") {
            acc[key] = value
        } else if (
            Array.isArray(value) &&
            value.length > 0 &&
            !!value[0].thumbnails
        ) {
            // If there is a photo field, extract the first photo's URL using the specified image size
            // acc[key] = value[0]["thumbnails"][imageSize]["url"]
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
