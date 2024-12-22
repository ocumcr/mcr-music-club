// グローバル状態の管理
const PlayerState = {
    wasPlaying: false,
    record: null,
    audio: null,
    source: null,
    context: null,
    gain: null,
    playCounted: false,
    loopMode: parseInt(localStorage.getItem("loopMode") ?? "0"),
    shuffleMode: parseInt(localStorage.getItem("shuffleMode") ?? "0"),
    currentTrackIndex: 0,
    playlist: [],
    defaultOrderPlaylist: [],
}

// UIコントロール要素の参照
const UI = {
    elements: null,

    initialize() {
        this.elements = {
            playButton: document.getElementById("play-button"),
            seekBar: document.getElementById("seekBar"),
            currentTimeEl: document.getElementById("currentTime"),
            durationEl: document.getElementById("duration"),
            volumeControl: document.getElementById("volume"),
            musicTitle: document.getElementById("music-title"),
            miniThumbnail: document.getElementById("mini-thumbnail"),
            loopButton: document.getElementById("loop-button"),
            shuffleButton: document.getElementById("shuffle-button"),
            backButton: document.getElementById("back-button"),
            forwardButton: document.getElementById("forward-button"),
        }

        this.initializeVolume()
        this.updateLoopButtonUI()
        this.updateShuffleButtonUI()
    },

    initializeVolume() {
        this.elements.volumeControl.value = localStorage.getItem("volume") ?? 50
    },

    updateLoopButtonUI() {
        const loopStates = ["loop-none", "", "loop-one"]
        const loopTitles = ["ループしない", "ループする", "一曲ループ"]

        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[PlayerState.loopMode]}"></i>
        `
        this.elements.loopButton.title = loopTitles[PlayerState.loopMode]
    },

    updateShuffleButtonUI() {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][PlayerState.shuffleMode]}"></i>
        `
    },

    updatePlayButtonUI(isPlaying) {
        this.elements.playButton.innerHTML = `
            <i class="fa-solid fa-${isPlaying ? "pause" : "play"}"></i>
        `
    },

    updateTrackInfo(track) {
        this.elements.musicTitle.innerHTML = `${track.title}<br />${track.author}`
        this.elements.miniThumbnail.style.backgroundImage = `url(${track.thumbnail})`
        this.elements.miniThumbnail.style.backgroundSize = "cover"
    },

    updateDurationUI(formattedTime) {
        this.elements.durationEl.innerText = formattedTime
    },

    updateSeekBarMax(max) {
        this.elements.seekBar.max = max
    },

    updateSeekBarAndCurrentTimeUI(time) {
        this.elements.currentTimeEl.innerText = formatTime(time)

        this.elements.seekBar.value = time
    },

    setPlayCount() {
        const list = document.querySelectorAll(".play-count")

        if (!PlayerState.record) return

        PlayerState.playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (PlayerState.record[obj.title] ?? 0)
        })
    },

    setSearchBox(text) {
        document.getElementById("search").value = text
    },

    removeNowPlayingTrack() {
        const nowPlayingTrack = document.querySelector(".playing")
        if (nowPlayingTrack) {
            nowPlayingTrack.classList.remove("playing")
        }
    },

    setNowPlayingTrack({ index }) {
        document.querySelectorAll(".track h3")[index].classList.add("playing")
    },
}

// オーディオ処理のクラス<-UI,PlayerState
class AudioController {
    static async initializeAudio(track) {
        if (PlayerState.context === null) {
            PlayerState.context = new AudioContext()
            PlayerState.gain = PlayerState.context.createGain()
            PlayerState.gain.connect(PlayerState.context.destination)
        }

        if (PlayerState.audio) {
            PlayerState.audio.pause()
            PlayerState.source.disconnect()
        }

        PlayerState.audio = new Audio(track.path)
        PlayerState.audio.loop = PlayerState.loopMode === 2
        PlayerState.source = PlayerState.context.createMediaElementSource(PlayerState.audio)
        PlayerState.source.connect(PlayerState.gain)

        this.setupSeekBarUpdate(PlayerState.audio)

        this.updateVolume()

        return new Promise((resolve) => {
            PlayerState.audio.onloadedmetadata = (e) => {
                resolve()
            }
        })
    }

    static setupSeekBarUpdate(audio) {
        // 再生中にシークバーを更新
        audio.ontimeupdate = () => {
            UI.updateSeekBarAndCurrentTimeUI(audio.currentTime)

            // ループ再生を検知
            if (PlayerState.loopMode == 2 && audio.duration - audio.currentTime < 0.65) {
                safeSendPlayCount(PlaylistManager.getCurrentTrackTitle())
            }
        }
    }

    static updateVolume() {
        if (!PlayerState.gain) return
        PlayerState.gain.gain.value = UI.elements.volumeControl.value / 100
    }
}

// プレイリスト管理のクラス
class PlaylistManager {
    static setPlaylist(playlist) {
        PlayerState.defaultOrderPlaylist = playlist
        PlayerState.playlist = PlayerState.shuffleMode ? this.shuffleArray(playlist) : playlist
    }

    static setOrder() {
        const currentTrack = PlayerState.playlist[PlayerState.currentTrackIndex]

        PlayerState.currentTrackIndex = PlayerState.defaultOrderPlaylist.indexOf(currentTrack)

        PlayerState.playlist = [...PlayerState.defaultOrderPlaylist]
        renderMusicList(PlayerState.playlist)
        UI.setPlayCount()

        UI.setNowPlayingTrack({ index: PlayerState.currentTrackIndex })

        if (PlayerState.currentTrackIndex == 0) {
            window.scrollTo({ top: 0, behavior: "smooth" })
        } else {
            const track = document.querySelectorAll(".track")[PlayerState.currentTrackIndex - 1]

            track.scrollIntoView({
                behavior: "smooth",
            })
        }
    }

    static shufflePlaylist({ moveCurrentTrackToTop }) {
        const currentTrack = PlayerState.playlist[PlayerState.currentTrackIndex]

        // 今再生しているトラックを一番目に持ってくる
        do {
            PlayerState.playlist = this.shuffleArray(PlayerState.playlist)
        } while (moveCurrentTrackToTop && PlayerState.playlist[0] != currentTrack)

        if (moveCurrentTrackToTop) {
            PlayerState.currentTrackIndex = 0
        }

        renderMusicList(PlayerState.playlist)
        UI.setPlayCount()

        UI.setNowPlayingTrack({ index: PlayerState.currentTrackIndex })

        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    static shuffleArray(array) {
        if (array.length == 1) return [...array]

        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1))
            ;[arr[idx], arr[rand]] = [arr[rand], cur]
            return arr
        })
    }

    static getCurrentTrackTitle() {
        return PlayerState.playlist[PlayerState.currentTrackIndex].title
    }

    static getNextTrack() {
        const nextIndex = (PlayerState.currentTrackIndex + 1) % PlayerState.playlist.length
        return { track: PlayerState.playlist[nextIndex], index: nextIndex }
    }

    static getPreviousTrack() {
        const prevIndex =
            (PlayerState.currentTrackIndex - 1 + PlayerState.playlist.length) % PlayerState.playlist.length
        return { track: PlayerState.playlist[prevIndex], index: prevIndex }
    }
}

// イベントハンドラの設定
class EventHandlers {
    static initialize() {
        this.setupPlaybackControls()
        this.setupSeekBarControls()
        this.setupVolumeControls()
        this.setupLoopAndShuffleControls()
        this.setupKeyboardControls()
        this.setupTitle()
        this.setupMiniThumbnail()
        this.setupVisibilityHandler()
    }

    static setupPlaybackControls() {
        UI.elements.playButton.addEventListener("click", () => this.togglePlayback())
        UI.elements.backButton.onclick = () => this.handleBackButton()
        UI.elements.forwardButton.onclick = () => this.handleForwardButton()
    }

    static setupSeekBarControls() {
        UI.elements.seekBar.addEventListener("input", () => {
            if (!PlayerState.audio) return
            PlayerState.audio.currentTime = UI.elements.seekBar.value
        })
    }

    static setupVolumeControls() {
        UI.elements.volumeControl.addEventListener("input", (e) => {
            localStorage.setItem("volume", e.target.value)
            AudioController.updateVolume()
        })
    }

    static setupLoopAndShuffleControls() {
        UI.elements.loopButton.addEventListener("click", () => {
            PlayerState.loopMode = (PlayerState.loopMode + 1) % 3
            localStorage.setItem("loopMode", PlayerState.loopMode)
            UI.updateLoopButtonUI()
            if (PlayerState.audio) {
                PlayerState.audio.loop = PlayerState.loopMode === 2
            }
        })

        UI.elements.shuffleButton.addEventListener("click", () => {
            PlayerState.shuffleMode = 1 - PlayerState.shuffleMode
            localStorage.setItem("shuffleMode", PlayerState.shuffleMode)
            UI.updateShuffleButtonUI()

            if (PlayerState.shuffleMode == 1) {
                PlaylistManager.shufflePlaylist({
                    moveCurrentTrackToTop: true,
                })
            } else {
                PlaylistManager.setOrder()
            }
        })
    }

    static setupTitle() {
        document.getElementById("title").addEventListener("click", (e) => {
            e.preventDefault()
            window.location.href = window.location.origin + window.location.pathname
        })
    }

    static setupKeyboardControls() {
        window.addEventListener("keydown", (e) => {
            if (e.code === "Space") {
                e.preventDefault()
                this.togglePlayback()
            }
        })
    }

    static setupMiniThumbnail() {
        UI.elements.musicTitle.addEventListener("click", () => {
            if (PlayerState.currentTrackIndex == 0) {
                window.scrollTo({ top: 0, behavior: "smooth" })
            } else {
                const track = document.querySelectorAll(".track")[PlayerState.currentTrackIndex - 1]

                track.scrollIntoView({
                    behavior: "smooth",
                })
            }
        })
    }

    static togglePlayback() {
        if (!PlayerState.audio) return

        if (PlayerState.audio.paused) {
            PlayerState.audio.play()
            UI.updatePlayButtonUI(true)
        } else {
            PlayerState.audio.pause()
            UI.updatePlayButtonUI(false)
        }
    }

    static async handleBackButton() {
        if (PlayerState.audio && PlayerState.audio.currentTime > 0.5) {
            PlayerState.audio.currentTime = 0
            return
        }

        const { track, index } = PlaylistManager.getPreviousTrack()
        await this.changeTrack(track, index)
    }

    static async handleForwardButton() {
        this.playNextTrack()
    }

    static async changeTrack(track, index) {
        UI.removeNowPlayingTrack()

        await AudioController.initializeAudio(track)

        UI.updateTrackInfo(track)
        UI.updatePlayButtonUI(true)
        UI.updateSeekBarMax(PlayerState.audio.duration)
        UI.updateDurationUI(formatTime(PlayerState.audio.duration))

        UI.setNowPlayingTrack({
            index: index,
        })

        setNavigationMenu(track)

        PlayerState.currentTrackIndex = index
        PlayerState.audio.play()

        this.setupTrackEndedHandler()

        safeSendPlayCount(PlaylistManager.getCurrentTrackTitle())
    }

    static async playNextTrack() {
        const isLastTrack = PlayerState.playlist.length - 1 == PlayerState.currentTrackIndex

        if (isLastTrack) {
            window.scrollTo({ top: 0, behavior: "smooth" })
        }

        if (isLastTrack && PlayerState.shuffleMode == 1) {
            PlaylistManager.shufflePlaylist({
                moveCurrentTrackToTop: false,
            })
        }

        const { track, index } = PlaylistManager.getNextTrack()
        await this.changeTrack(track, index)
    }

    static setupTrackEndedHandler() {
        PlayerState.audio.onended = async () => {
            if (PlayerState.loopMode === 1) {
                this.playNextTrack()
            } else if (PlayerState.loopMode === 0) {
                const { track, index } = PlaylistManager.getNextTrack()
                if (index !== 0) {
                    await this.changeTrack(track, index)
                } else {
                    UI.updatePlayButtonUI(false)
                }
            }
        }
    }

    static setupVisibilityHandler() {
        document.addEventListener("visibilitychange", async () => {
            if (document.visibilityState === "visible") {
                if (PlayerState.wasPlaying) {
                    navigator.mediaSession.playbackState = "playing"

                    try {
                        await PlayerState.context.resume()
                        await PlayerState.audio.play()
                    } catch (e) {
                        console.warn("Playback resume failed:", e)
                    }
                }
            } else {
                // ページから離れる時の処理
                PlayerState.wasPlaying = !PlayerState.audio.paused

                navigator.mediaSession.playbackState = "paused"
            }
        })
    }
}

safeSendPlayCount = (title) => {
    if (!PlayerState.playCounted) {
        sendPlayCount(title)
        PlayerState.playCounted = true
        setTimeout(() => {
            PlayerState.playCounted = false
        }, 1000)
    }
}

// アプリケーションの初期化
async function initializeApp() {
    UI.initialize()
    EventHandlers.initialize()

    const response = await fetch("music-data.json")
    let data = await response.json()

    const url = new URL(location.href)
    const search = url.searchParams.get("search")

    if (search) {
        data = data.filter((m) => m.tags.includes(search) || m.title.includes(search) || m.author === search)
        UI.setSearchBox(search)
    }

    if (url.searchParams.get("debug") == "true") {
        console.log("開けゴマ!")
        document.getElementById("debug-log").style.display = "block"
    }

    PlaylistManager.setPlaylist(data)
    renderMusicList(PlayerState.playlist)
}

// 音楽リストのレンダリング
function renderMusicList(data) {
    const ol = document.querySelector(".musics")

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
                        <p>${track.year}年</p>
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

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

window.addEventListener("DOMContentLoaded", initializeApp)

const onClickTag = (tag) => {
    const url = new URL(location.href)
    url.searchParams.set("search", tag)
    location.href = url.href
}

fetchPlayCountData().then((record) => {
    PlayerState.record = record

    UI.setPlayCount()
})

// メニューに出るやつ
const setNavigationMenu = (track) => {
    if (!"mediaSession" in navigator) return

    navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title ?? "",
        artist: track.author ?? "",
        artwork: [{ src: track.thumbnail ?? "" }],
    })

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

        PlayerState.audio.currentTime = e.seekTime
    })
}

const addLog = (text) => {
    console.log(text)
    // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
    document.getElementById("debug-log").innerHTML += text + "<br />"
}
