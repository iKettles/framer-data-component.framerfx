import * as React from "react"
import * as Papa from "papaparse"
import { nanoid } from "nanoid"
import { getDataSourceUrl, sanitizePropertyName } from "../utils/data"
import { AUTH_ERROR_MESSAGE } from "../utils/errors"
import { parseHttpHeaders } from "../utils/helpers"
import { normalizeAirtableFields } from "../utils/data"
import {
    AirtableImageSize,
    AirtableResponse,
    APIResponse,
    CSVResponse,
    DataItem,
    DataSource,
    DataSourceFileType,
    FormatDataCallback,
    JSONResponse,
    SearchDataCallback,
    SortDataCallback,
    SortDirection,
} from "../utils/types"
import { useSortedSearchResults } from "./useSortedSearchResults"
import { delay } from "../utils"

export function useCuratedDataSource(
    dataSource: DataSource,
    dataSourceFileType: DataSourceFileType,
    apiResponseDataKey: string | null,
    apiUrl: string | null,
    airtableUrl: string | null,
    tsvUrl: string | null,
    csvUrl: string | null,
    jsonUrl: string | null,
    airtableImageSize: AirtableImageSize,
    loadingDelay: number,
    isSearchEnabled: boolean,
    searchTerm: string,
    shouldSort: boolean,
    sortKey: string,
    sortDirection: SortDirection,
    onFormatData?: FormatDataCallback,
    onSortData?: SortDataCallback,
    onSearchData?: SearchDataCallback,
    httpHeaders?: {
        parsedHeaders: Record<string, string>
        unparsedHeaders: string[]
    }
): [any[], boolean, string | null] {
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [data, setData] = React.useState([])

    const [results] = useSortedSearchResults(
        data,
        isSearchEnabled,
        searchTerm,
        shouldSort,
        sortKey,
        sortDirection,
        onSortData,
        onSearchData
    )

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
                    setData([])
                    return
                }

                setIsLoading(true)

                let parsedHttpHeaders: Record<string, string>

                if (httpHeaders) {
                    parsedHttpHeaders = {
                        ...httpHeaders.parsedHeaders,
                        ...parseHttpHeaders(httpHeaders.unparsedHeaders),
                    }
                }

                const timeStarted = Date.now()

                const response = await fetch(url, {
                    headers: parsedHttpHeaders,
                })

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error(AUTH_ERROR_MESSAGE)
                    }
                }

                const body = await parseResponse(
                    response,
                    dataSource,
                    dataSourceFileType,
                    apiResponseDataKey,
                    airtableImageSize
                )

                const timeFinished = Date.now()
                const minimumLoadingDuration = loadingDelay * 1000
                const roundTripDuration = timeFinished - timeStarted
                const remainingLoadingDuration =
                    minimumLoadingDuration - roundTripDuration

                if (remainingLoadingDuration > 0) {
                    await delay(remainingLoadingDuration)
                }

                if (onFormatData) {
                    setData(onFormatData(body))
                } else {
                    setData(
                        body.map((item) => ({
                            ...Object.keys(item).reduce((acc, key) => {
                                acc[sanitizePropertyName(key)] = item[key]
                                return acc
                            }, {}),
                            id: item.id || nanoid(5),
                        }))
                    )
                }

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
        loadingDelay,

        onFormatData,
    ])

    return [results, isLoading, errorMessage]
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
                return {
                    ...normalizeAirtableFields(
                        record.fields,
                        airtableImageSize
                    ),
                    id: record.id,
                }
            }
        )
    }
    if (dataSource === "file") {
        if (dataSourceFileType === "json") {
            return (await response.json()) as JSONResponse
        }
        if (dataSourceFileType === "csv" || dataSourceFileType === "tsv") {
            const parseResponse = Papa.parse(await response.text(), {
                header: true,
                dynamicTyping: true,
            })
            if (parseResponse.errors.length) {
                throw new Error(
                    `Failed to parse ${dataSourceFileType}: ${parseResponse.errors[0].code} ${parseResponse.errors[0].message}`
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