import { Record } from "../Model/Record"
import { Content } from "../View/Content"
import { ContentEvents } from "./ContentEvents"

// プレイリスト管理のクラス
export class PlaylistManager {
    static #playlist: Readonly<Track[]> = []
    static #defaultOrderPlaylist: Readonly<Track[]> = []

    static playingTrackTitle: string = ""

    static getPlayingTrackIndex(): number {
        return this.#playlist.findIndex((track) => track.title === this.playingTrackTitle)
    }

    static hasPlayingTrack() {
        return this.getPlayingTrackIndex() !== -1
    }

    static setPlaylist(playlist: readonly Track[], shuffle: boolean) {
        this.#defaultOrderPlaylist = playlist
        this.#playlist = shuffle ? this.#shuffleArray([...playlist]) : playlist
        this.#onChangePlaylist()
    }

    static getPlaylist() {
        return this.#playlist
    }

    static setDefaultOrder() {
        this.#playlist = [...this.#defaultOrderPlaylist]
        this.#onChangePlaylist()
    }

    static shufflePlaylist({ moveCurrentTrackToTop }: { moveCurrentTrackToTop: boolean }) {
        if (this.hasPlayingTrack()) {
            const currentTrack = this.#playlist[this.getPlayingTrackIndex()]

            // 今再生しているトラックを一番目に持ってくる
            do {
                this.#playlist = this.#shuffleArray([...this.#playlist])
            } while (moveCurrentTrackToTop && this.#playlist[0] != currentTrack)
        } else {
            this.#playlist = this.#shuffleArray([...this.#playlist])
        }

        this.#onChangePlaylist()
    }

    static getNextTrack() {
        if (!this.hasPlayingTrack()) return { track: this.#playlist[0] }
        const nextIndex = (this.getPlayingTrackIndex() + 1) % this.#playlist.length
        return { track: this.#playlist[nextIndex] }
    }

    static getPreviousTrack() {
        if (!this.hasPlayingTrack()) return { track: this.#playlist[0] }
        const prevIndex = (this.getPlayingTrackIndex() - 1 + this.#playlist.length) % this.#playlist.length
        return { track: this.#playlist[prevIndex] }
    }

    static #shuffleArray(array: any[]) {
        if (array.length == 1) return [...array]

        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1))
            ;[arr[idx], arr[rand]] = [arr[rand], cur]
            return arr
        })
    }

    static #onChangePlaylist() {
        // やらなくちゃいけない
        Content.renderPlaylist(this.#playlist, Record.playCountRecord)
        ContentEvents.setupTrackClickEvents()

        // 最悪やらなくていい
        Content.updatePlayingClass(this.getPlayingTrackIndex())
    }
}
