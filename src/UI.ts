import { EventHandlers } from "./EventHandler.js"
import { LocalStorage } from "./LocalStorage.js"
import { PlayerState } from "./PlayerState.js"
import { formatTime } from "./playMusic.js"

// UIコントロール要素の参照
export class Footer {
    static elements: {
        playButton: HTMLElement
        seekBar: HTMLInputElement
        currentTimeEl: HTMLElement
        durationEl: HTMLElement
        volumeControl: HTMLInputElement
        musicTitle: HTMLElement
        miniThumbnail: HTMLElement
        loopButton: HTMLElement
        shuffleButton: HTMLElement
        backButton: HTMLElement
        forwardButton: HTMLElement
    }

    static init() {
        this.elements = {
            playButton: document.getElementById("play-button") as HTMLElement,
            seekBar: document.getElementById("seekBar") as HTMLInputElement,
            currentTimeEl: document.getElementById("currentTime") as HTMLElement,
            durationEl: document.getElementById("duration") as HTMLElement,
            volumeControl: document.getElementById("volume") as HTMLInputElement,
            musicTitle: document.getElementById("music-title") as HTMLElement,
            miniThumbnail: document.getElementById("mini-thumbnail") as HTMLElement,
            loopButton: document.getElementById("loop-button") as HTMLElement,
            shuffleButton: document.getElementById("shuffle-button") as HTMLElement,
            backButton: document.getElementById("back-button") as HTMLElement,
            forwardButton: document.getElementById("forward-button") as HTMLElement,
        }

        this.#initializeVolume()
        this.updateLoopButtonUI()
        this.updateShuffleButtonUI()
    }

    static #initializeVolume() {
        this.elements.volumeControl.value = "" + LocalStorage.volume
    }

    static updateLoopButtonUI() {
        const loopStates = ["loop-none", "", "loop-one"]
        const loopTitles = ["ループしない", "ループする", "一曲ループ"]

        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[PlayerState.loopMode]}"></i>
        `
        this.elements.loopButton.title = loopTitles[PlayerState.loopMode]
    }

    static updateShuffleButtonUI() {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][PlayerState.shuffleMode]}"></i>
        `
    }

    static updatePlayButtonUI(isPlaying: boolean) {
        this.elements.playButton.innerHTML = `
            <i class="fa-solid fa-${isPlaying ? "pause" : "play"}"></i>
        `
    }

    static updateTrackInfo(track: Track) {
        this.elements.musicTitle.innerHTML = `${track.title}<br />${track.author}`
        this.elements.miniThumbnail.style.backgroundImage = `url(${track.thumbnail})`
        this.elements.miniThumbnail.style.backgroundSize = "cover"
    }

    static updateDurationUI(formattedTime: string) {
        this.elements.durationEl.innerText = formattedTime
    }

    static updateSeekBarMax(max: number) {
        this.elements.seekBar.max = String(max)
    }

    static updateSeekBarAndCurrentTimeUI(time: number) {
        this.elements.currentTimeEl.innerText = formatTime(time)
        this.elements.seekBar.value = String(time)
    }

    static setPlayCount() {
        const list = document.querySelectorAll<HTMLElement>(".play-count")

        if (!PlayerState.record) return

        PlayerState.playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (PlayerState.record[obj.title] ?? 0)
        })
    }

    static removeNowPlayingTrack() {
        const nowPlayingTrack = document.querySelector(".playing")
        if (nowPlayingTrack) {
            nowPlayingTrack.classList.remove("playing")
        }
    }

    static setNowPlayingTrack({ index }: { index: number }) {
        const tracks = document.querySelectorAll<HTMLHeadingElement>(".track h3")
        if (tracks[index]) {
            tracks[index].classList.add("playing")
        }
    }
}

export class Header {
    static title: HTMLElement
    static debugLog: HTMLElement
    static #search: HTMLInputElement

    static init() {
        this.title = document.getElementById("title")!
        this.debugLog = document.getElementById("debug-log")!
        this.#search = document.getElementById("search") as HTMLInputElement
    }

    static setSearchBox(text: string) {
        this.#search.value = text
    }
}

export class TrackElement {
    static renderMusicList(data: Track[]) {
        const ol = document.querySelector(".musics")!

        const createTrackElement = (track: Track, index: number) => `
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
        `

        ol.innerHTML = data.map(createTrackElement).join("")

        // 各トラックのクリックイベントを設定
        document.querySelectorAll(".img-box").forEach((box, index) => {
            box.addEventListener("click", async () => {
                await EventHandlers.changeTrack(data[index], index)
            })
        })
    }
}
