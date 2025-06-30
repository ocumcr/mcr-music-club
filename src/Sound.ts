export class Sound {
    static #isReady = false

    static audio: HTMLAudioElement | null = null

    static #source: MediaElementAudioSourceNode
    static #context: AudioContext
    static #gain: GainNode

    static load(src: string, loop: boolean) {
        if (!this.#context) {
            this.#context = new AudioContext()
            this.#gain = this.#context.createGain()
            this.#gain.connect(this.#context.destination)
        }

        if (this.audio) {
            this.audio.pause()
            this.#source.disconnect()
        }

        this.audio = new Audio(src)
        this.audio.loop = loop
        this.#source = this.#context.createMediaElementSource(this.audio)
        this.#source.connect(this.#gain)

        return new Promise<void>((resolve) => {
            this.audio!.onloadedmetadata = (e) => {
                this.#isReady = true

                resolve()
            }
        })
    }

    static play() {
        if (!this.isReady()) return
        this.audio.play()
    }

    static pause() {
        if (!this.isReady()) return
        this.audio.pause()
    }

    static isPlaying(): boolean {
        return this.isReady() && !this.audio.paused
    }

    static setLoop(loop: boolean) {
        if (!this.isReady()) return
        this.audio.loop = loop
    }

    static isReady(): this is typeof Sound & { audio: HTMLAudioElement } {
        return this.#isReady
    }

    static setVolume(volume: number) {
        if (volume < 0 || 1 < volume) {
            console.error("volume must range from 0 to 1.")
            return
        }

        this.#gain.gain.value = volume
    }

    static getDuration(): number {
        return this.isReady() ? this.audio.duration : 0
    }

    static set currentTime(second: number) {
        if (!this.isReady()) return
        this.audio.currentTime = second
    }

    static get currentTime(): number {
        return this.isReady() ? this.audio.currentTime : 0
    }
}
