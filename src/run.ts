import { Header, Footer, Content } from "./UI.js"
import { ContentEvents, EventHandlers, FooterEvents, HeaderEvents } from "./EventHandler.js"
import { PlayerState } from "./PlayerState.js"
import { handleQueryChange } from "./playMusic.js"
import { fetchPlayCountData } from "./survey.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Navigation } from "./Navigation.js"
import { LocalStorage } from "./LocalStorage.js"

window.addEventListener("DOMContentLoaded", initializeApp)

// アプリケーションの初期化
async function initializeApp() {
    Footer.init(LocalStorage.loopMode, LocalStorage.shuffleMode, LocalStorage.volume)
    Header.init()
    Content.init()
    EventHandlers.init()
    HeaderEvents.init()
    FooterEvents.init()
    ContentEvents.init()
    Navigation.init()

    const response = await fetch("music-data.json")
    PlayerState.data = Object.freeze(await response.json())
    PlaylistManager.setPlaylist(PlayerState.data, PlayerState.shuffleMode === 1)

    // 初期ロード時のクエリ処理
    handleQueryChange()

    PlayerState.playCountRecord = Object.freeze(await fetchPlayCountData())
    Content.setPlayCount(PlaylistManager.playlist, PlayerState.playCountRecord)
}
