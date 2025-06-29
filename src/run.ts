import { Header, Footer, Content } from "./UI.js"
import { EventHandlers } from "./EventHandler.js"
import { PlayerState } from "./PlayerState.js"
import { handleQueryChange } from "./playMusic.js"
import { fetchPlayCountData } from "./survey.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Navigation } from "./Navigation.js"

window.addEventListener("DOMContentLoaded", initializeApp)

// アプリケーションの初期化
async function initializeApp() {
    Footer.init()
    Header.init()
    Content.init()
    EventHandlers.init()

    const response = await fetch("music-data.json")
    PlayerState.data = Object.freeze(await response.json())
    PlaylistManager.setPlaylist(PlayerState.data)

    // 初期ロード時のクエリ処理
    handleQueryChange()

    Navigation.setupNavigationMenu()

    PlayerState.playCountRecord = Object.freeze(await fetchPlayCountData())
    Content.setPlayCount()
}
