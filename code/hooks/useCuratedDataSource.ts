import * as React from "react"
import * as Papa from "papaparse"
import { nanoid } from "nanoid"
import * as _ from "lodash"
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
    DataOverride,
    DataSource,
    DataSourceFileType,
    FormatDataCallback,
    JSONResponse,
    SearchConfig,
    SearchDataCallback,
    SortDataCallback,
    SortDirection,
} from "../utils/types"
import { useSortedSearchResults } from "./useSortedSearchResults"
import { delay } from "../utils"

export function useCuratedDataSource(
    dataOverride: DataOverride,
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
    searchConfig: SearchConfig,
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
        searchConfig,
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
                    return setData([])
                }

                /**
                 * If the data is being overridden and there's no loading delay, immediately return the data
                 * to avoid unnecessary loading when this component re-renders.
                 */
                if (dataOverride && !loadingDelay) {
                    return setData(
                        onFormatData
                            ? onFormatData(dataOverride)
                            : sanitizeResponseBody(dataOverride)
                    )
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

                const body = dataOverride
                    ? dataOverride
                    : await fetchData(
                          url,
                          dataSource,
                          dataSourceFileType,
                          apiResponseDataKey,
                          airtableImageSize,
                          parsedHttpHeaders
                      )

                const remainingLoadingDuration = getRemainingLoadingDuration(
                    loadingDelay,
                    timeStarted
                )

                if (remainingLoadingDuration > 0) {
                    await delay(remainingLoadingDuration)
                }

                setData(
                    onFormatData
                        ? onFormatData(body)
                        : sanitizeResponseBody(body)
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
        }

        const pickedValues = _.at(body, apiResponseDataKey)

        if (!pickedValues.length) {
            throw new Error(
                `Data key ${apiResponseDataKey} doesn't exist on response body`
            )
        }

        return pickedValues[0]
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

async function fetchData(
    url: string,
    dataSource: DataSource,
    dataSourceFileType: DataSourceFileType,
    apiResponseDataKey: string | null,
    airtableImageSize: AirtableImageSize,
    parsedHttpHeaders: Record<string, string>
) {
    const response = await fetch(url, {
        headers: parsedHttpHeaders,
    })

    if (!response.ok && (response.status === 401 || response.status === 403)) {
        throw new Error(AUTH_ERROR_MESSAGE)
    }

    const body = await parseResponse(
        response,
        dataSource,
        dataSourceFileType,
        apiResponseDataKey,
        airtableImageSize
    )

    return body
}

function getRemainingLoadingDuration(
    loadingDelay: number,
    timeStarted: number
) {
    const timeFinished = Date.now()
    const minimumLoadingDuration = loadingDelay * 1000
    const roundTripDuration = timeFinished - timeStarted

    return minimumLoadingDuration - roundTripDuration
}

function sanitizeResponseBody(body: Record<string, any>[]) {
    return body.map((item) => ({
        ...Object.keys(item).reduce((acc, key) => {
            acc[sanitizePropertyName(key)] = item[key]
            return acc
        }, {}),
        id: item.id || nanoid(5),
    }))
}
