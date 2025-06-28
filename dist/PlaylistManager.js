import { PlayerState } from "./PlayerState.js";
import { Content } from "./UI.js";
// プレイリスト管理のクラス
export class PlaylistManager {
    static playlist = [];
    static defaultOrderPlaylist = [];
    static currentTrackIndex = -1;
    static isPlayed() {
        return this.currentTrackIndex !== -1;
    }
    static setPlaylist(playlist) {
        this.defaultOrderPlaylist = playlist;
        this.playlist = PlayerState.shuffleMode ? this.#shuffleArray([...playlist]) : playlist;
    }
    static setDefaultOrder() {
        if (this.isPlayed()) {
            const currentTrack = this.playlist[this.currentTrackIndex];
            this.currentTrackIndex = this.defaultOrderPlaylist.indexOf(currentTrack);
            this.playlist = [...this.defaultOrderPlaylist];
        }
        Content.renderMusicList(this.playlist);
        Content.scrollTo(this.currentTrackIndex - 1);
        Content.setNowPlayingTrack({ index: this.currentTrackIndex });
    }
    static shufflePlaylist({ moveCurrentTrackToTop }) {
        if (this.isPlayed()) {
            const currentTrack = this.playlist[this.currentTrackIndex];
            // 今再生しているトラックを一番目に持ってくる
            do {
                this.playlist = this.#shuffleArray([...this.playlist]);
            } while (moveCurrentTrackToTop && this.playlist[0] != currentTrack);
            if (moveCurrentTrackToTop) {
                this.currentTrackIndex = 0;
            }
        }
        else {
            this.playlist = this.#shuffleArray([...this.playlist]);
        }
        Content.renderMusicList(this.playlist);
        Content.scrollTo(-1);
        Content.setNowPlayingTrack({ index: this.currentTrackIndex });
    }
    static getCurrentTrackTitle() {
        if (!this.isPlayed())
            return null;
        return this.playlist[this.currentTrackIndex].title;
    }
    static getNextTrack() {
        if (!this.isPlayed())
            throw Error("");
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        return { track: this.playlist[nextIndex], index: nextIndex };
    }
    static getPreviousTrack() {
        if (!this.isPlayed())
            throw Error("");
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        return { track: this.playlist[prevIndex], index: prevIndex };
    }
    static #shuffleArray(array) {
        if (array.length == 1)
            return [...array];
        return [...array].reduce((_, cur, idx, arr) => {
            const rand = Math.floor(Math.random() * (idx + 1));
            [arr[idx], arr[rand]] = [arr[rand], cur];
            return arr;
        });
    }
}
