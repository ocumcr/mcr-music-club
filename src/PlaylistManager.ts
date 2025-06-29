import { PlayerState } from "./PlayerState.js"
import { Content } from "./UI.js"

// プレイリスト管理のクラス
export class PlaylistManager {
    static playlist: Readonly<Track[]> = []
    static defaultOrderPlaylist: Readonly<Track[]> = []

    static currentTrackIndex: number = -1

    static isAvailable() {
        return this.currentTrackIndex !== -1
    }

    static setPlaylist(playlist: readonly Track[]) {
        this.defaultOrderPlaylist = playlist
        this.playlist = PlayerState.shuffleMode ? this.#shuffleArray([...playlist]) : playlist
    }

    static setDefaultOrder() {
        if (this.isAvailable()) {
            const currentTrack = this.playlist[this.currentTrackIndex]

            this.currentTrackIndex = this.defaultOrderPlaylist.indexOf(currentTrack)
        }

        this.playlist = [...this.defaultOrderPlaylist]

        Content.renderMusicList(this.playlist)
        Content.scrollTo(this.currentTrackIndex - 1)
        Content.setNowPlayingTrack({ index: this.currentTrackIndex })
    }

    static shufflePlaylist({ moveCurrentTrackToTop }: { moveCurrentTrackToTop: boolean }) {
        if (this.isAvailable()) {
            const currentTrack = this.playlist[this.currentTrackIndex]

            // 今再生しているトラックを一番目に持ってくる
            do {
                this.playlist = this.#shuffleArray([...this.playlist])
            } while (moveCurrentTrackToTop && this.playlist[0] != currentTrack)

            if (moveCurrentTrackToTop) {
                this.currentTrackIndex = 0
            }

            Content.scrollTo(-1)
        } else {
            this.playlist = this.#shuffleArray([...this.playlist])
        }

        Content.renderMusicList(this.playlist)
        Content.setNowPlayingTrack({ index: this.currentTrackIndex })
    }

    static getCurrentTrackTitle(): string | null {
        if (!this.isAvailable()) return null
        return this.playlist[this.currentTrackIndex].title
    }

    static getNextTrack() {
        if (!this.isAvailable()) return null
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length
        return { track: this.playlist[nextIndex], index: nextIndex }
    }

    static getPreviousTrack() {
        if (!this.isAvailable()) return null
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length
        return { track: this.playlist[prevIndex], index: prevIndex }
    }

    static #shuffleArray(array: any[]) {
        if (array.length == 1) return [...array]

        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1))
            ;[arr[idx], arr[rand]] = [arr[rand], cur]
            return arr
        })
    }
}
