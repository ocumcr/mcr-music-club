import { Record } from "../Model/Record.js"
import { LocalStorage } from "../Model/LocalStorage.js"
import { PlaylistManager } from "../Model/PlaylistManager.js"
import { Content } from "../View/Content.js"
import { Header } from "../View/Header.js"
import { Sound } from "../Model/Sound.js"
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

        Content.fadeIn()

        const title = PlaylistManager.getCurrentTrackTitle()

        Header.setSearchBox("")

        const search = this.#getSearchQuery()

        let data = Record.data
        if (search) {
            data = Record.data.filter(
                (track) => track.tags.includes(search) || track.title.includes(search) || track.author === search,
            )
            Header.setSearchBox(search)
        }

        PlaylistManager.setPlaylist(data, LocalStorage.shuffleMode === 1)
        PlaylistManager.currentTrackIndex = PlaylistManager.playlist.findIndex((track) => track.title === title)
        Content.renderPlaylist(PlaylistManager.playlist)

        if (Record.playCountRecord) {
            Content.setPlayCount(PlaylistManager.playlist, Record.playCountRecord)
        }

        ContentEvents.setupTrackClickEvents(PlaylistManager.playlist)

        if (Sound.isPlaying()) {
            Content.updatePlayingClass(PlaylistManager.currentTrackIndex)
        }
    }

    static #getSearchQuery(): string | null {
        const url = new URL(window.location.href)
        return url.searchParams.get("search") || null
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
