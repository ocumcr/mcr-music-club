export class URLManager {
    static getSearchQuery() {
        const url = new URL(window.location.href);
        return url.searchParams.get("search") || null;
    }
    static setSearchQuery(query) {
        const url = new URL(window.location.href);
        url.searchParams.set("search", query);
        window.history.pushState({}, "", url);
    }
    static clearSearchQuery() {
        const url = new URL(window.location.href);
        url.searchParams.delete("search");
        window.history.pushState({}, "", url);
    }
    static isDebugMode() {
        const url = new URL(window.location.href);
        return url.searchParams.get("debug") === "true";
    }
}
