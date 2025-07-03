import { EventHandlers } from "./Controller/EventHandlers.js"
import { ContentEvents } from "./Controller/ContentEvents.js"
import { HeaderEvents } from "./Controller/HeaderEvents.js"
import { FooterEvents } from "./Controller/FooterEvents.js"

import { Record } from "./Model/Record.js"
import { Survey } from "./Model/Survey.js"
import { PlaylistManager } from "./Model/PlaylistManager.js"
import { Navigation } from "./Controller/Navigation.js"
import { LocalStorage } from "./Model/LocalStorage.js"
import { URLManager } from "./Controller/URLManager.js"

import { Content } from "./View/Content.js"
import { Footer } from "./View/Footer.js"
import { Header } from "./View/Header.js"

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
    Record.data = Object.freeze(await response.json())
    PlaylistManager.setPlaylist(Record.data, LocalStorage.shuffleMode === 1)

    // 初期ロード時のクエリ処理
    URLManager.handleQueryChange()

    if (URLManager.isDebugMode()) {
        console.log("開けゴマ!")
        Content.debugLog.style.display = "block"
    }

    Record.playCountRecord = Object.freeze(await Survey.fetchPlayCountData())

    Content.setPlayCount(PlaylistManager.playlist, Record.playCountRecord!)
}

function tryInitialize() {
    try {
        initializeApp()
    } catch (error) {
        alert(error)
    }
}

if (document.readyState === "complete") {
    tryInitialize()
} else {
    document.addEventListener("DOMContentLoaded", tryInitialize)
}
