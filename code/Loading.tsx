import { motion, useAnimation } from "framer"
import * as React from "react"
import { useEffect, useRef } from "react"
import { useOnEnter, useOnExit } from "./hooks/useOnNavigationTargetChange"
import { handleTimeout } from "./utils"

function Material({ color }) {
    return (
        <motion.svg
            style={{
                height: "85%",
                width: "85%",
                overflow: "visible",
                originX: "50%",
                originY: "50%",
            }}
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", loop: Infinity, duration: 2 }}
            viewBox="25 25 50 50"
        >
            <motion.circle
                style={{
                    stroke: color,
                    strokeLinecap: "round",
                }}
                animate={{
                    strokeDasharray: ["1, 200", "89, 200", "89, 200"],
                    strokeDashoffset: [0, -35, -124],
                }}
                transition={{
                    duration: 1.5,
                    loop: Infinity,
                    ease: "easeInOut",
                }}
                cx="50"
                cy="50"
                r="20"
                fill="none"
                strokeWidth={2}
                strokeMiterlimit="10"
            />
        </motion.svg>
    )
}

export default function Loading(props) {
    const {
        duration,
        onTimeout,
        fadeOut,
        hasDuration,
        onClick,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        onMouseLeave,
    } = props

    const controls = useAnimation()
    const animDuration = fadeOut ? Math.min(duration, 0.35) : 0
    const animDelay = fadeOut ? duration - animDuration : duration
    const handlers = useRef<(() => void)[]>([])

    const onFadeOut = React.useCallback(() => {
        if (hasDuration)
            controls.start({
                opacity: 0,
                transition: { duration: animDuration, ease: "easeIn" },
            })
    }, [hasDuration, animDuration])

    const resetOpacity = async () => {
        controls.set({ opacity: 1 })
    }

    useOnEnter(() => {
        resetOpacity()
        if (hasDuration)
            handlers.current = [
                handleTimeout(duration, onTimeout),
                handleTimeout(animDelay, onFadeOut),
            ]
    })

    useOnExit(() => handlers.current.forEach((cleanup) => cleanup))
    useEffect(() => () => handlers.current.forEach((cleanup) => cleanup), [])

    return (
        <motion.div
            {...{ onClick, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave }}
            animate={controls}
            style={{
                position: "relative",
                overflow: "show",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
            }}
        >
            <Material {...props} />
        </motion.div>
    )
}

Loading.defaultProps = {
    height: 40,
    width: 40,
    duration: 2,
    hasDuration: false,
}
