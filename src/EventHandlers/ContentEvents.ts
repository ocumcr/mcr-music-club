import { PlaylistManager } from "../PlaylistManager.js"

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
            // アイコン
            track.querySelector<HTMLDivElement>(".img-box")!.onclick = () => {
                if (PlaylistManager.currentTrackIndex === i) {
                    // 現在のトラックがクリックされた場合は再生/一時停止を切り替える
                    EventHandlers.togglePlayback()
                } else {
                    // 別のトラックがクリックされた場合はそのトラックを再生する
                    EventHandlers.changeTrack(playlist[i], i)
                }
            }

            // 作者
            track.querySelector<HTMLParagraphElement>(".author")!.onclick = () => {
                URLManager.search(playlist[i].author)
            }

            // タグ
            track.querySelectorAll<HTMLButtonElement>(".tag-button").forEach((button, j) => {
                button.onclick = () => {
                    URLManager.search(playlist[i].tags[j])
                }
            })
        })
    }
}
