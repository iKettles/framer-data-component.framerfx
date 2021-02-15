import * as React from "react"
import { RenderTarget } from "framer"

type ComponentInstance = React.ReactNode & {
    props: {
        width: string | number
        height: string | number
        style: React.CSSProperties
    }
}

export function useConnectedComponentInstance(
    listItem: React.ReactNode
): [ComponentInstance] {
    const connectedListItem = React.useMemo<ComponentInstance>(() => {
        const listItemAsArray = React.Children.toArray(listItem)
        if (!listItemAsArray || !listItemAsArray.length) {
            return null
        }

        /**
         * If we're connecting a code component, we end up with a container React component
         * that wraps it. We check if the connected item has a component identifier
         * and then find the child using the connected component's children.
         *
         * When we connect a design component, we don't have this intermediate wrapper.
         */
        if (
            RenderTarget.current() === RenderTarget.canvas &&
            // @ts-ignore
            !!listItemAsArray[0].props.componentIdentifier
        ) {
            // @NOTE props["children"] is needed otherwise Framer will render a (multi) children connector
            return React.Children.toArray(
                // @ts-ignore
                listItemAsArray[0].props["children"]
            )[0]
        }

        return listItemAsArray[0]
    }, [listItem])

    return [connectedListItem]
}
