import * as React from "react"

export function useConnectedSmartComponent(
    listItem: React.ReactNode
): [React.ReactElement | null, React.ReactElement | null] {
    const [connectedContainer, connectedComponent] = React.useMemo<
        [React.ReactElement | null, React.ReactElement | null]
    >(() => {
        const listItemAsArray = React.Children.toArray(listItem)
        if (!listItemAsArray || !listItemAsArray.length) {
            return [null, null]
        }

        const container = listItemAsArray[0] as React.ReactElement
        const containerKey = container.key as string | undefined

        const containerChildren = React.Children.toArray(
            container.props.children
        )

        /**
         * Legacy design components do not have a component identifier.
         * They also do not have a key, and if they do, it is not suffixed
         * with -container. In this case, we return the component directly,
         * as we can spread the props of the data directly across it,
         * and we don't need to deal with component containers
         */
        if (
            !container.props.componentIdentifier &&
            (!containerKey || !containerKey.endsWith("-container"))
        ) {
            return [null, container]
        }

        if (!containerChildren || !containerChildren.length) {
            return [null, container]
        }

        const underlyingComponent = containerChildren[0]

        return [container, underlyingComponent]
    }, [listItem])

    return [connectedContainer, connectedComponent]
}
