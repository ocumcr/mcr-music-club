import { EventHandlers } from "./EventHandler.js";
import { PlayerState } from "./PlayerState.js";
import { PlaylistManager } from "./PlaylistManager.js";
import { Sound } from "./Sound.js";
import { sendPlayCount } from "./survey.js";
import { Header, Content } from "./UI.js";
let playCounted = false;
export const safeSendPlayCount = (title) => {
    if (!playCounted && !location.search.includes("debug")) {
        sendPlayCount(title);
        playCounted = true;
        setTimeout(() => {
            playCounted = false;
        }, 1000);
    }
};
window.onClickTag = (tag) => {
    const url = new URL(location.href);
    url.searchParams.set("search", "" + tag);
    history.pushState(null, "", url.href);
    handleQueryChange();
};
// メニューに出るやつ
export const setNavigationMenu = (track) => {
    if (!("mediaSession" in navigator))
        return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title ?? "",
        artist: track.author ?? "",
        artwork: [{ src: track.thumbnail ?? "" }],
    });
};
export const setupNavigationMenu = () => {
    if (!("mediaSession" in navigator))
        return;
    // 再生コントロール対応
    navigator.mediaSession.setActionHandler("play", (e) => {
        addLog(e.action);
        navigator.mediaSession.playbackState = "playing";
        EventHandlers.togglePlayback();
    });
    navigator.mediaSession.setActionHandler("pause", (e) => {
        addLog(e.action);
        navigator.mediaSession.playbackState = "paused";
        EventHandlers.togglePlayback();
    });
    navigator.mediaSession.setActionHandler("nexttrack", (e) => {
        addLog(e.action);
        EventHandlers.handleForwardButton();
    });
    navigator.mediaSession.setActionHandler("previoustrack", (e) => {
        addLog(e.action);
        EventHandlers.handleBackButton();
    });
    navigator.mediaSession.setActionHandler("seekto", (e) => {
        addLog(e.action + ": " + e.seekTime);
        if (!Sound.isReady())
            return;
        Sound.audio.currentTime = +e.seekTime;
    });
    navigator.mediaSession.setActionHandler("seekbackward", (e) => {
        addLog(e.action + ": " + e.seekOffset);
        if (!Sound.isReady())
            return;
        Sound.audio.currentTime -= +e.seekOffset;
    });
    navigator.mediaSession.setActionHandler("seekforward", (e) => {
        addLog(e.action + ": " + e.seekOffset);
        if (!Sound.isReady())
            return;
        Sound.audio.currentTime += +e.seekOffset;
    });
};
const addLog = (text) => {
    console.log(text);
    // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
    Content.debugLog.innerHTML += text + "<br />";
};
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
    console.log("クエリパラメータが変更されました: ");
    Content.content.classList.remove("fade-in");
    requestAnimationFrame(() => {
        Content.content.classList.add("fade-in");
    });
    const title = PlaylistManager.getCurrentTrackTitle();
    Header.setSearchBox("");
    const url = new URL(location.href);
    const search = url.searchParams.get("search");
    let data = PlayerState.data;
    if (search) {
        data = PlayerState.data.filter((track) => track.tags.includes(search) || track.title.includes(search) || track.author === search);
        Header.setSearchBox(search);
    }
    if (url.searchParams.get("debug") === "true") {
        console.log("開けゴマ!");
        Content.debugLog.style.display = "block";
    }
    PlaylistManager.setPlaylist(data);
    PlaylistManager.currentTrackIndex = PlaylistManager.playlist.findIndex((track) => track.title === title);
    Content.renderMusicList(PlaylistManager.playlist);
}
// 履歴変更検知用のイベントリスナー
window.addEventListener("popstate", (event) => {
    event.preventDefault(); // ページ遷移をキャンセル
    handleQueryChange(); // 関数実行
    console.log("popped");
});
