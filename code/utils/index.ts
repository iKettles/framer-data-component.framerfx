export async function delay(duration: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration)
    })
}
