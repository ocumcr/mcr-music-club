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

        this.elements.loopButton.dataset["loop"] = loopStates[loopMode]

        this.elements.loopButton.title = loopTitles[loopMode]
    }

    static updateShuffleButtonUI(shuffleMode: ShuffleMode) {
        this.elements.shuffleButton.classList.toggle("shuffle-off", shuffleMode === 0)
    }

    static updatePlayButtonUI(isPlaying: boolean) {
        this.elements.playButton.classList.toggle("button-playing", isPlaying)
    }

    static updateTrackInfo(track: Track) {
        this.elements.musicTitle.innerHTML = `${track.title}<br />${track.author}`
        this.elements.miniThumbnail.style.backgroundImage = `url(${track.thumbnail})`
        this.elements.miniThumbnail.style.backgroundSize = "cover"
    }

    static updateSeekBarMaxAndDurationText(max: number) {
        this.elements.durationText.innerText = this.#formatTime(max)
        this.elements.seekBar.max = String(max)
    }

    static updateSeekBarAndCurrentTimeText(time: number) {
        this.elements.currentTimeText.innerText = this.#formatTime(time)
        this.elements.seekBar.value = String(time)
    }

    static #formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    }
}
