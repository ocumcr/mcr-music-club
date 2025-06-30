import { EventHandlers } from "./EventHandlers/EventHandlers.js"
import { ContentEvents } from "./EventHandlers/ContentEvents.js"
import { HeaderEvents } from "./EventHandlers/HeaderEvents.js"
import { FooterEvents } from "./EventHandlers/FooterEvents.js"

import { AppState } from "./AppState.js"
import { handleQueryChange } from "./playMusic.js"
import { fetchPlayCountData } from "./survey.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Navigation } from "./Navigation.js"
import { LocalStorage } from "./LocalStorage.js"

import { Content } from "./UI/Content.js"
import { Footer } from "./UI/Footer.js"
import { Header } from "./UI/Header.js"

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
    AppState.data = Object.freeze(await response.json())
    PlaylistManager.setPlaylist(AppState.data, AppState.shuffleMode === 1)

    // 初期ロード時のクエリ処理
    handleQueryChange()

    AppState.playCountRecord = Object.freeze(await fetchPlayCountData())

    Content.setPlayCount(PlaylistManager.playlist, AppState.playCountRecord)
}
