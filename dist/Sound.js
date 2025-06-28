export class Sound {
    static #isReady = false;
    static audio = null;
    static #source;
    static #context;
    static #gain;
    static load(src, loop) {
        if (!this.#context) {
            this.#context = new AudioContext();
            this.#gain = this.#context.createGain();
            this.#gain.connect(this.#context.destination);
        }
        if (this.audio) {
            this.audio.pause();
            this.#source.disconnect();
        }
        this.audio = new Audio(src);
        this.audio.loop = loop;
        this.#source = this.#context.createMediaElementSource(this.audio);
        this.#source.connect(this.#gain);
        return new Promise((resolve) => {
            this.audio.onloadedmetadata = (e) => {
                this.#isReady = true;
                resolve();
            };
        });
    }
    static isReady() {
        return this.#isReady;
    }
    static setVolume(volume) {
        this.#gain.gain.value = volume;
    }
}
