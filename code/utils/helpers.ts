export function parseHttpHeaders(unparsedHeaders: string[]) {
    return unparsedHeaders.reduce<Record<string, string>>((acc, header) => {
        const key = header.substr(0, header.indexOf(":"))
        const value = header.substr(header.indexOf(":") + 1)

        if (!key || !value) {
            return acc
        }

        acc[key.trim()] = value.trim()

        return acc
    }, {})
}
