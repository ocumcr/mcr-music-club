import { AppState } from "./AppState.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { sendPlayCount } from "./survey.js"

import { Content } from "./UI/Content.js"
import { Header } from "./UI/Header.js"

import { URLManager } from "./URLManager.js"

let playCounted = false

export const safeSendPlayCount = (title: string) => {
    if (!playCounted && !URLManager.isDebugMode()) {
        sendPlayCount(title)

        playCounted = true

        setTimeout(() => {
            playCounted = false
        }, 1000)
    }
}

// export const getMobileOS = () => {
//     const ua = navigator.userAgent
//     if (/android/i.test(ua)) {
//         return "Android"
//     } else if (/iPad|iPhone|iPod/.test(ua)) {
//         return "iOS"
//     }

//     return "Other"
// }

// クエリ変更時に呼び出される関数
export function handleQueryChange() {
    console.log("クエリパラメータが変更されました: ")

    Content.fadeIn()

    const title = PlaylistManager.getCurrentTrackTitle()

    Header.setSearchBox("")

    const search = URLManager.getSearchQuery()

    let data = AppState.data
    if (search) {
        data = AppState.data.filter(
            (track) => track.tags.includes(search) || track.title.includes(search) || track.author === search,
        )
        Header.setSearchBox(search)
    }

    if (URLManager.isDebugMode()) {
        console.log("開けゴマ!")
        Content.debugLog.style.display = "block"
    }

    PlaylistManager.setPlaylist(data, AppState.shuffleMode === 1)
    PlaylistManager.currentTrackIndex = PlaylistManager.playlist.findIndex((track) => track.title === title)
    Content.renderPlaylist(PlaylistManager.playlist)
    Content.updatePlayingClass(PlaylistManager.currentTrackIndex)
}

// 履歴変更検知用のイベントリスナー
window.addEventListener("popstate", (event) => {
    event.preventDefault() // ページ遷移をキャンセル

    handleQueryChange() // 関数実行

    console.log("popped")
})
