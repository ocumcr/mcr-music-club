export class Navigation {
    static setPositionState(audio: HTMLAudioElement) {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
        })
    }

    static setNavigationMenu(track: Track) {
        if (!("mediaSession" in navigator)) return

        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title ?? "",
            artist: track.author ?? "",
            artwork: [{ src: track.thumbnail ?? "" }],
        })
    }
}
