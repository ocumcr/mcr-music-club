import { EventHandlers } from "./EventHandler.js"
import { PlayerState } from "./PlayerState.js"
import { PlaylistManager } from "./PlaylistManager.js"
import { Sound } from "./Sound.js"
import { fetchPlayCountData, sendPlayCount } from "./survey.js"
import { Path, UI } from "./UI.js"

export const safeSendPlayCount = (title: string) => {
    if (!PlayerState.playCounted) {
        sendPlayCount(title)
        PlayerState.playCounted = true
        setTimeout(() => {
            PlayerState.playCounted = false
        }, 1000)
    }
}

// 音楽リストのレンダリング
export function renderMusicList(data: Track[]) {
    const ol = document.querySelector(".musics")!

    ol.innerHTML = data
        .map(
            (track, index) => `
                <li class="track">
                    <div class="img-box" style="
                        background: url(${track.thumbnail});
                        background-size: cover;
                    "></div>
                    <div class="description">
                        <h3>${track.title}</h3>
                        <p>${track.year}</p>
                        <p onclick="onClickTag('${track.author}')" class="author">${track.author}</p>
                        <p>${track.description}</p>
                        <div class="tags">
                            ${track.tags
                                .map(
                                    (tag) => `
                                <button class="tag-button" onclick="onClickTag('${tag}')">#${tag}</button>
                            `,
                                )
                                .join("")}
                        </div>
                    </div>
                    <div class="play-count">取得中...</div>
                </li>
            `,
        )
        .join("")

    // 各トラックのクリックイベントを設定
    document.querySelectorAll(".img-box").forEach((box, index) => {
        box.addEventListener("click", async () => {
            await EventHandlers.changeTrack(data[index], index)
        })
    })
}

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export const onClickTag = (tag: number) => {
    const url = new URL(location.href)
    url.searchParams.set("search", "" + tag)
    history.pushState(null, "", url.href)
    handleQueryChange()
}

fetchPlayCountData().then((record) => {
    PlayerState.record = record

    UI.setPlayCount()
})

// メニューに出るやつ
export const setNavigationMenu = (track: Track) => {
    if (!("mediaSession" in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title ?? "",
        artist: track.author ?? "",
        artwork: [{ src: track.thumbnail ?? "" }],
    })
}

export const setupNavigationMenu = () => {
    if (!("mediaSession" in navigator)) return

    // 再生コントロール対応
    navigator.mediaSession.setActionHandler("play", (e) => {
        addLog(e.action)
        navigator.mediaSession.playbackState = "playing"
        EventHandlers.togglePlayback()
    })

    navigator.mediaSession.setActionHandler("pause", (e) => {
        addLog(e.action)
        navigator.mediaSession.playbackState = "paused"
        EventHandlers.togglePlayback()
    })

    navigator.mediaSession.setActionHandler("nexttrack", (e) => {
        addLog(e.action)
        EventHandlers.handleForwardButton()
    })

    navigator.mediaSession.setActionHandler("previoustrack", (e) => {
        addLog(e.action)
        EventHandlers.handleBackButton()
    })

    navigator.mediaSession.setActionHandler("seekto", (e) => {
        addLog(e.action + ": " + e.seekTime)

        if (!Sound.isReady()) return

        Sound.audio.currentTime = +e.seekTime!
    })

    navigator.mediaSession.setActionHandler("seekbackward", (e) => {
        addLog(e.action + ": " + e.seekOffset)

        if (!Sound.isReady()) return

        Sound.audio.currentTime -= +e.seekOffset!
    })

    navigator.mediaSession.setActionHandler("seekforward", (e) => {
        addLog(e.action + ": " + e.seekOffset)

        if (!Sound.isReady()) return

        Sound.audio.currentTime += +e.seekOffset!
    })
}

const addLog = (text: string) => {
    console.log(text)
    // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
    Path.debugLog.innerHTML += text + "<br />"
}

export const getMobileOS = () => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
        return "Android"
    } else if (/iPad|iPhone|iPod/.test(ua)) {
        return "iOS"
    }

    return "Other"
}

// クエリ変更時に呼び出される関数
export function handleQueryChange() {
    console.log("クエリパラメータが変更されました: ")

    const url = new URL(location.href)
    const search = url.searchParams.get("search")

    let data = PlayerState.data

    UI.setSearchBox("")

    if (search) {
        data = PlayerState.data.filter(
            (m) => m.tags.includes(search) || m.title.includes(search) || m.author === search,
        )
        UI.setSearchBox(search)
    }

    if (url.searchParams.get("debug") == "true") {
        console.log("開けゴマ!")
        Path.debugLog.style.display = "block"
    }

    PlaylistManager.setPlaylist(data)
    renderMusicList(PlayerState.playlist)

    UI.setPlayCount()
}

// 履歴変更検知用のイベントリスナー
window.addEventListener("popstate", (event) => {
    event.preventDefault() // ページ遷移をキャンセル

    const params = new URLSearchParams(window.location.search).toString()
    handleQueryChange() // 関数実行

    console.log("pop")
})
