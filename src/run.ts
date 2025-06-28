import { Path, UI } from "./UI.js"
import { EventHandlers } from "./EventHandler.js"
import { PlayerState } from "./PlayerState.js"
import { handleQueryChange, setupNavigationMenu } from "./playMusic.js"

window.addEventListener("DOMContentLoaded", initializeApp)

// アプリケーションの初期化
async function initializeApp() {
    UI.initialize()
    Path.init()
    EventHandlers.initialize()

    const response = await fetch("music-data.json")
    PlayerState.data = await response.json()

    // 初期ロード時のクエリ処理
    handleQueryChange()

    setupNavigationMenu()
}
