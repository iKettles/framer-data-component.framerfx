import * as Framer from "framer"
import { useRef } from "react"

export function useOnEnter(onEnter: () => void, enabled?: boolean): void {
    return useOnSpecificTargetChange(true, onEnter, enabled)
}

export function useOnExit(onExit: () => void, enabled?: boolean): void {
    return useOnSpecificTargetChange(false, onExit, enabled)
}

function useOnSpecificTargetChange(
    goal: boolean,
    callback: () => void,
    enabled = true
): void {
    const cache = useRef(false)
    try {
        const isInTarget = Framer.useIsInCurrentNavigationTarget()

        if (cache.current !== isInTarget) {
            cache.current = isInTarget

            if (enabled && isInTarget === goal) callback()
        }
    } catch (e) {}
}
