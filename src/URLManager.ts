export class URLManager {
    static getSearchQuery(): string | null {
        const url = new URL(window.location.href)
        return url.searchParams.get("search") || null
    }

    static setSearchQuery(query: string) {
        const url = new URL(window.location.href)
        url.searchParams.set("search", query)
        window.history.pushState({}, "", url)
    }

    static clearSearchQuery() {
        const url = new URL(window.location.href)
        url.searchParams.delete("search")
        window.history.pushState({}, "", url)
    }

    static isDebugMode(): boolean {
        const url = new URL(window.location.href)
        return url.searchParams.get("debug") === "true"
    }
}
