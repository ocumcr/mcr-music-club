import { PlayerState } from "./PlayerState.js";
import { formatTime } from "./playMusic.js";
// UIコントロール要素の参照
export class UI {
    static elements;
    static initialize() {
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
        this.updateLoopButtonUI();
        this.updateShuffleButtonUI();
    }
    static #initializeVolume() {
        this.elements.volumeControl.value = localStorage.getItem("volume") ?? "50";
    }
    static updateLoopButtonUI() {
        const loopStates = ["loop-none", "", "loop-one"];
        const loopTitles = ["ループしない", "ループする", "一曲ループ"];
        this.elements.loopButton.innerHTML = `
            <i class="fa-solid fa-repeat ${loopStates[PlayerState.loopMode]}"></i>
        `;
        this.elements.loopButton.title = loopTitles[PlayerState.loopMode];
    }
    static updateShuffleButtonUI() {
        this.elements.shuffleButton.innerHTML = `
            <i class="fa-solid fa-shuffle ${["shuffle-off", ""][PlayerState.shuffleMode]}"></i>
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
    static updateDurationUI(formattedTime) {
        this.elements.durationEl.innerText = formattedTime;
    }
    static updateSeekBarMax(max) {
        this.elements.seekBar.max = String(max);
    }
    static updateSeekBarAndCurrentTimeUI(time) {
        this.elements.currentTimeEl.innerText = formatTime(time);
        this.elements.seekBar.value = String(time);
    }
    static setPlayCount() {
        const list = document.querySelectorAll(".play-count");
        if (!PlayerState.record)
            return;
        PlayerState.playlist.forEach((obj, i) => {
            list[i].innerText = "再生回数: " + (PlayerState.record[obj.title] ?? 0);
        });
    }
    static setSearchBox(text) {
        const search = document.getElementById("search");
        if (search)
            search.value = text;
    }
    static removeNowPlayingTrack() {
        const nowPlayingTrack = document.querySelector(".playing");
        if (nowPlayingTrack) {
            nowPlayingTrack.classList.remove("playing");
        }
    }
    static setNowPlayingTrack({ index }) {
        const tracks = document.querySelectorAll(".track h3");
        if (tracks[index]) {
            tracks[index].classList.add("playing");
        }
    }
}
export class Path {
    static title;
    static debugLog;
    static init() {
        this.title = document.getElementById("title");
        this.debugLog = document.getElementById("debug-log");
    }
}
