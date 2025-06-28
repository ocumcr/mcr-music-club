export class Sound {
    static #isReady = false

    static audio?: HTMLAudioElement

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

    static isReady(): this is typeof Sound & { audio: HTMLAudioElement } {
        return this.#isReady
    }

    static setVolume(volume: number) {
        this.#gain.gain.value = volume
    }
}
