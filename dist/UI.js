import { EventHandlers } from "./EventHandler.js";
import { LocalStorage } from "./LocalStorage.js";
import { PlayerState } from "./PlayerState.js";
import { PlaylistManager } from "./PlaylistManager.js";
import { handleQueryChange } from "./playMusic.js";
import { URLManager } from "./URLManager.js";
// UIコントロール要素の参照
export class Footer {
    static elements;
    static init() {
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
        };
        this.#initializeVolume();
        this.updateLoopButtonUI(LocalStorage.loopMode);
        this.updateShuffleButtonUI(LocalStorage.shuffleMode);
    }
    static #initializeVolume() {
        this.elements.volumeControl.value = "" + LocalStorage.volume;
    }
    static updateLoopButtonUI(loopMode) {
        const loopStates = ["loop-none", "", "loop-one"];
        const loopTitles = ["ループしない", "ループする", "一曲ループ"];
        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[loopMode]}"></i>
        `;
        this.elements.loopButton.title = loopTitles[loopMode];
    }
    static updateShuffleButtonUI(shuffleMode) {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][shuffleMode]}"></i>
        `;
    }
    static updatePlayButtonUI(isPlaying) {
        this.elements.playButton.innerHTML = `
            <i class="fa-solid fa-${isPlaying ? "pause" : "play"}"></i>
        `;
    }
    static updateTrackInfo(track) {
        this.elements.musicTitle.innerHTML = `${track.title}<br />${track.author}`;
        this.elements.miniThumbnail.style.backgroundImage = `url(${track.thumbnail})`;
        this.elements.miniThumbnail.style.backgroundSize = "cover";
    }
    static updateDurationUI(time) {
        this.elements.durationEl.innerText = this.#formatTime(time);
    }
    static updateSeekBarMax(max) {
        this.elements.seekBar.max = String(max);
    }
    static updateSeekBarAndCurrentTimeUI(time) {
        this.elements.currentTimeEl.innerText = this.#formatTime(time);
        this.elements.seekBar.value = String(time);
    }
    static #formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
}
export class Header {
    static title;
    static #search;
    static init() {
        this.title = document.getElementById("title");
        this.#search = document.getElementById("search");
        const form = document.querySelector(".search");
        form.onsubmit = (e) => {
            e.preventDefault();
            URLManager.setSearchQuery(this.#search.value);
            // 必要ならここで検索処理を呼び出す
            handleQueryChange();
        };
    }
    static setSearchBox(text) {
        this.#search.value = text;
    }
}
export class Content {
    static debugLog;
    static content;
    static init() {
        this.debugLog = document.getElementById("debug-log");
        this.content = document.querySelector(".content");
    }
    static fadeIn() {
        this.content.classList.remove("fade-in");
        requestAnimationFrame(() => {
            this.content.classList.add("fade-in");
        });
    }
    static scrollTo(index) {
        if (index <= -1) {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
        else {
            const track = document.querySelectorAll(".track")[index];
            track.scrollIntoView({
                behavior: "smooth",
            });
        }
    }
    static renderMusicList(data) {
        const ol = document.querySelector(".musics");
        const createTrackElement = (track) => `
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
                        ${track.tags
            .map((tag) => `
                                    <button class="tag-button" onclick="onClickTag('${tag}')">#${tag}</button>
                                `)
            .join("")}
                    </div>
                </div>
                <div class="play-count">取得中...</div>
            </li>
        `;
        ol.innerHTML = data.map(createTrackElement).join("");
        // 各トラックのクリックイベントを設定
        document.querySelectorAll(".img-box").forEach((box, index) => {
            box.addEventListener("click", async () => {
                if (PlaylistManager.currentTrackIndex === index) {
                    EventHandlers.togglePlayback();
                }
                else {
                    await EventHandlers.changeTrack(data[index], index);
                }
            });
        });
        this.setPlayCount();
        if (!PlaylistManager.isAvailable())
            return;
        this.setNowPlayingTrack({ index: PlaylistManager.currentTrackIndex });
    }
    static setPlayCount() {
        const list = document.querySelectorAll(".play-count");
        if (!PlayerState.playCountRecord)
            return;
        PlaylistManager.playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (PlayerState.playCountRecord[obj.title] ?? 0);
        });
    }
    static removeNowPlayingTrack() {
        document.querySelector(".playing")?.classList.remove("playing");
    }
    static setNowPlayingTrack({ index }) {
        document.querySelectorAll(".track")[index]?.classList.add("playing");
    }
}
