import { Record } from "../Model/Record.js"
import { LocalStorage } from "../Model/LocalStorage.js"
import { PlaylistManager } from "../Model/PlaylistManager.js"
import { Content } from "../View/Content.js"
import { Header } from "../View/Header.js"
import { ContentEvents } from "./ContentEvents.js"

export class URLManager {
    static isDebugMode(): boolean {
        const url = new URL(window.location.href)
        return url.searchParams.get("debug") === "true"
    }

    static search(text: string) {
        if (text === "") {
            this.#clearSearchQuery()
        } else {
            this.#setSearchQuery(text)
        }

        this.handleQueryChange()
    }

    static handleQueryChange() {
        console.log("クエリパラメータが変更されました")

        this.#setPlaylist()
        this.#render()
    }

    static #setPlaylist() {
        const search = this.#getSearchQuery()

        let playlist = Record.data
        if (search !== "") {
            playlist = Record.data.filter(
                (track) => track.tags.includes(search) || track.title.includes(search) || track.author === search,
            )
        }

        Header.setSearchBox(search)

        PlaylistManager.setPlaylist(playlist, LocalStorage.shuffleMode === 1)
    }

    static #render() {
        Content.fadeIn()
        Content.renderPlaylist(PlaylistManager.playlist, Record.playCountRecord)
        Content.updatePlayingClass(PlaylistManager.getCurrentTrackIndex())

        ContentEvents.setupTrackClickEvents()
    }

    static #getSearchQuery(): string {
        const url = new URL(window.location.href)
        return url.searchParams.get("search") ?? ""
    }

    static #setSearchQuery(query: string) {
        const url = new URL(window.location.href)
        url.searchParams.set("search", query)
        window.history.pushState({}, "", url)
    }

    static #clearSearchQuery() {
        const url = new URL(window.location.href)
        url.searchParams.delete("search")
        window.history.pushState({}, "", url)
    }
}

// 履歴変更検知用のイベントリスナー
window.addEventListener("popstate", (event) => {
    event.preventDefault() // ページ遷移をキャンセル

    URLManager.handleQueryChange() // 関数実行

    console.log("popped")
})
