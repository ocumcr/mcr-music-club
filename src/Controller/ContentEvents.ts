import { PlaylistManager } from "./PlaylistManager.js"
import { URLManager } from "./URLManager.js"
import { EventHandlers } from "./EventHandlers.js"

import { Content } from "../View/Content.js"

export class ContentEvents {
    static #initialized = false

    static init() {
        if (this.#initialized) throw new Error("すでにinitialized!")

        if (URLManager.isDebugMode()) {
            console.log("開けゴマ!")
            Content.displayDebugLog()
        }

        this.#initialized = true
    }

    // playlistが変更されたら、描画とともにイベントも更新すべき
    static setupTrackClickEvents() {
        const playlist = PlaylistManager.getPlaylist()

        document.querySelectorAll(".track").forEach((track, i) => {
            // アイコン
            track.querySelector<HTMLDivElement>(".img-box")!.onclick = () => {
                if (PlaylistManager.getPlayingTrackIndex() === i) {
                    // 現在のトラックがクリックされた場合は再生/一時停止を切り替える
                    EventHandlers.togglePlayback()
                } else {
                    // 別のトラックがクリックされた場合はそのトラックを再生する
                    EventHandlers.changeTrack(playlist[i])
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
