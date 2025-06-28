export class LocalStorage {
    static set volume(volume) {
        localStorage.setItem("volume", "" + volume);
    }
    static get volume() {
        return localStorage["volume"] ? Number(localStorage["volume"]) : 50;
    }
    static set loopMode(loopMode) {
        localStorage.setItem("loopMode", "" + loopMode);
    }
    static get loopMode() {
        return (localStorage["loopMode"] ? Number(localStorage["loopMode"]) : 0);
    }
    static set shuffleMode(loopMode) {
        localStorage.setItem("shuffleMode", "" + loopMode);
    }
    static get shuffleMode() {
        return (localStorage["shuffleMode"] ? Number(localStorage["shuffleMode"]) : 0);
    }
}
