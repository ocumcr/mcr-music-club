import { Header, Footer, Content } from "./UI.js";
import { EventHandlers } from "./EventHandler.js";
import { PlayerState } from "./PlayerState.js";
import { handleQueryChange, setupNavigationMenu } from "./playMusic.js";
import { fetchPlayCountData } from "./survey.js";
window.addEventListener("DOMContentLoaded", initializeApp);
// アプリケーションの初期化
async function initializeApp() {
    Footer.init();
    Header.init();
    EventHandlers.init();
    const response = await fetch("music-data.json");
    PlayerState.data = Object.freeze(await response.json());
    // 初期ロード時のクエリ処理
    handleQueryChange();
    setupNavigationMenu();
    PlayerState.playCountRecord = Object.freeze(await fetchPlayCountData());
    Content.setPlayCount();
}
