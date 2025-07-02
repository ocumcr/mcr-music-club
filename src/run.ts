import { EventHandlers } from "./EventHandlers/EventHandlers.js"
import { ContentEvents } from "./EventHandlers/ContentEvents.js"
import { HeaderEvents } from "./EventHandlers/HeaderEvents.js"
import { FooterEvents } from "./EventHandlers/FooterEvents.js"

import { Record } from "./Record.js"
import { Survey } from "./Survey.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Navigation } from "./Navigation.js"
import { LocalStorage } from "./LocalStorage.js"
import { URLManager } from "./URLManager.js"

import { Content } from "./UI/Content.js"
import { Footer } from "./UI/Footer.js"
import { Header } from "./UI/Header.js"

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

    Content.setPlayCount(PlaylistManager.playlist, Record.playCountRecord)
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
