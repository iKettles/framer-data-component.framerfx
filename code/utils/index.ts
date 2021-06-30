export async function delay(duration: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration)
    })
}

export function handleTimeout(duration: number, callback: () => void) {
    const id = setTimeout(callback, duration * 1000)
    return () => clearTimeout(id)
}
