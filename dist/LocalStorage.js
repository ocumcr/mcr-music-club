export class LocalStorage {
    static set volume(volume) {
        localStorage.set("volume", "" + volume);
    }
    static get volume() {
        return localStorage["volume"] ? Number(localStorage["volume"]) : 50;
    }
    static set loopMode(loopMode) {
        localStorage.set("loopMode", "" + loopMode);
    }
    static get loopMode() {
        return (localStorage["loopMode"] ? Number(localStorage["shuffleMode"]) : 0);
    }
    static set shuffleMode(loopMode) {
        localStorage.set("shuffleMode", "" + loopMode);
    }
    static get shuffleMode() {
        return (localStorage["shuffleMode"] ? Number(localStorage["shuffleMode"]) : 0);
    }
}
