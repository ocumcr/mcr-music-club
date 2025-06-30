import { PlaylistManager } from "../PlaylistManager.js"
import { handleQueryChange } from "../playMusic.js"

import { URLManager } from "../URLManager.js"
import { EventHandlers } from "./EventHandlers.js"

export class ContentEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        this.#initialized = true
    }

    static setupTrackClickEvents(playlist: readonly Track[]) {
        document.querySelectorAll(".track").forEach((track, i) => {
            track.querySelector(".img-box")!.addEventListener("click", () => {
                if (PlaylistManager.currentTrackIndex === i) {
                    // 現在のトラックがクリックされた場合は再生/一時停止を切り替える
                    EventHandlers.togglePlayback()
                } else {
                    // 別のトラックがクリックされた場合はそのトラックを再生する
                    EventHandlers.changeTrack(playlist[i], i)
                }
            })

            track.querySelectorAll(".tag-button").forEach((button, j) => {
                button.addEventListener("click", () => {
                    this.#onClickTag(playlist[i].tags[j])
                })
            })
        })
    }

    static #onClickTag(tag: string) {
        URLManager.setSearchQuery(tag)
        handleQueryChange()
    }
}
