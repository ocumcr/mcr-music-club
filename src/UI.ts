import { ContentEvents } from "./EventHandler.js"
import { LoopMode, PlayCountRecord, PlayerState, ShuffleMode } from "./PlayerState.js"

// UIコントロール要素の参照
export class Footer {
    static elements: {
        playButton: HTMLElement
        seekBar: HTMLInputElement
        currentTimeText: HTMLElement
        durationText: HTMLElement
        volumeControl: HTMLInputElement
        musicTitle: HTMLElement
        miniThumbnail: HTMLElement
        loopButton: HTMLElement
        shuffleButton: HTMLElement
        backButton: HTMLElement
        forwardButton: HTMLElement
    }

    static init(loopMode: LoopMode, shuffleMode: ShuffleMode, volume: number) {
        this.elements = {
            playButton: document.getElementById("play-button") as HTMLElement,
            seekBar: document.getElementById("seekBar") as HTMLInputElement,
            currentTimeText: document.getElementById("currentTime") as HTMLElement,
            durationText: document.getElementById("duration") as HTMLElement,
            volumeControl: document.getElementById("volume") as HTMLInputElement,
            musicTitle: document.getElementById("music-title") as HTMLElement,
            miniThumbnail: document.getElementById("mini-thumbnail") as HTMLElement,
            loopButton: document.getElementById("loop-button") as HTMLElement,
            shuffleButton: document.getElementById("shuffle-button") as HTMLElement,
            backButton: document.getElementById("back-button") as HTMLElement,
            forwardButton: document.getElementById("forward-button") as HTMLElement,
        }

        this.#initializeVolume(volume)
        this.updateLoopButtonUI(loopMode)
        this.updateShuffleButtonUI(shuffleMode)
    }

    static #initializeVolume(volume: number) {
        this.elements.volumeControl.value = "" + volume
    }

    static updateLoopButtonUI(loopMode: LoopMode) {
        const loopStates = ["loop-none", "", "loop-one"]
        const loopTitles = ["ループしない", "ループする", "一曲ループ"]

        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[loopMode]}"></i>
        `
        this.elements.loopButton.title = loopTitles[loopMode]
    }

    static updateShuffleButtonUI(shuffleMode: ShuffleMode) {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][shuffleMode]}"></i>
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

    static updateDurationUI(time: number) {
        this.elements.durationText.innerText = this.#formatTime(time)
    }

    static updateSeekBarMax(max: number) {
        this.elements.seekBar.max = String(max)
    }

    static updateSeekBarAndCurrentTimeUI(time: number) {
        this.elements.currentTimeText.innerText = this.#formatTime(time)
        this.elements.seekBar.value = String(time)
    }

    static #formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
}

export class Header {
    static title: HTMLElement
    static search: HTMLInputElement

    static init() {
        this.title = document.getElementById("title")!
        this.search = document.getElementById("search") as HTMLInputElement
    }

    static setSearchBox(text: string) {
        this.search.value = text
    }
}

export class Content {
    static debugLog: HTMLElement
    static content: HTMLElement
    static #musics: HTMLOListElement

    static init() {
        this.debugLog = document.getElementById("debug-log")!
        this.content = document.querySelector(".content")!
        this.#musics = document.querySelector(".musics") as HTMLOListElement
    }

    static addLog(text: string) {
        console.log(text)
        // document.getElementById("debug-log").innerHTML += navigator.mediaSession.playbackState + "<br />"
        this.debugLog.innerHTML += text + "<br />"
    }

    static fadeIn() {
        this.content.classList.remove("fade-in")
        requestAnimationFrame(() => {
            this.content.classList.add("fade-in")
        })
    }

    static scrollTo(index: number) {
        if (index <= -1) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            })
        } else {
            const track = document.querySelectorAll(".track")[index]

            track.scrollIntoView({
                behavior: "smooth",
            })
        }
    }

    static renderPlaylist(playlist: readonly Track[]) {
        this.#musics.innerHTML = playlist.map(this.#createTrackElement).join("")

        ContentEvents.setupTrackClickEvents(playlist)
        this.setPlayCount(playlist, PlayerState.playCountRecord)
    }

    static #createTrackElement(track: Track) {
        const tags = track.tags.map((tag) => `<button class="tag-button">#${tag}</button>`).join("")

        return `
            <li class="track">
                <div class="img-box" style="
                    background: url(${track.thumbnail});
                    background-size: cover;
                ">
                    <i class="fa-solid fa-circle-play"></i>
                    <i class="fa-solid fa-circle-pause"></i>
                </div>
                <div class="description">
                    <h3>${track.title}</h3>
                    <p>${track.year}</p>
                    <p onclick="onClickTag('${track.author}')" class="author">${track.author}</p>
                    <p>${track.description}</p>
                    <div class="tags">
                        ${tags}
                    </div>
                </div>
                <div class="play-count">取得中...</div>
            </li>
        `
    }

    static setPlayCount(playlist: readonly Track[], playCountRecord: PlayCountRecord) {
        const list = document.querySelectorAll<HTMLElement>(".play-count")

        playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (playCountRecord[obj.title] ?? 0)
        })
    }

    static updateNowPlayingTrack(index: number) {
        document.querySelectorAll(".track").forEach((track, i) => track.classList.toggle("playing", i === index))
    }
}
