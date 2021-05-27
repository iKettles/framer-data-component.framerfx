import Fuse from "fuse.js"
import * as React from "react"
import {
    DataItem,
    SearchConfig,
    SearchDataCallback,
    SortDataCallback,
    SortDirection,
    SortKey,
} from "../utils/types"

export function useSortedSearchResults(
    data: DataItem[],
    isSearchEnabled: boolean,
    searchTerm: string | null,
    searchConfig: SearchConfig,
    shouldSort: boolean,
    sortKey: SortKey,
    sortDirection: SortDirection,
    onSortData?: SortDataCallback,
    onSearchData?: SearchDataCallback
): [DataItem[]] {
    const results = React.useMemo(() => {
        const keysToSearch = Object.keys(data[0] || {}).filter((key) => {
            // Do not search avatar/image fields
            if (/avatar|image/g.test(key)) {
                return false
            }
            return true
        })

        let dataToSort = data

        if (!!searchTerm && isSearchEnabled) {
            if (onSearchData) {
                dataToSort = onSearchData(data, searchTerm)
            } else {
                dataToSort = new Fuse([...data], {
                    includeScore: true,
                    keys: keysToSearch,
                    ...(searchConfig || {}),
                })
                    .search(searchTerm)
                    .map((result) => result.item)
            }
        }

        if (onSortData) {
            return onSortData(dataToSort, sortDirection, sortKey)
        }

        return dataToSort.sort((a, b) => {
            if (!shouldSort) {
                return 0
            }

            const isSortingNumerically = typeof a[sortKey] === "number"
            const isSortingAlphabetically = typeof a[sortKey] === "string"

            if (isSortingNumerically) {
                return sortDirection === "ascending"
                    ? a[sortKey] - b[sortKey]
                    : b[sortKey] - a[sortKey]
            } else if (isSortingAlphabetically) {
                if (sortDirection === "ascending") {
                    return (a[sortKey] as string).localeCompare(b[sortKey])
                } else {
                    return (b[sortKey] as string).localeCompare(a[sortKey])
                }
            }

            return 0
        })
    }, [
        data,
        searchTerm,
        shouldSort,
        sortKey,
        sortDirection,
        onSortData,
        onSearchData,
    ])

    return [results]
}
