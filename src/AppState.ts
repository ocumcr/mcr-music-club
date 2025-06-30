import { LocalStorage } from "./LocalStorage.js"

// グローバル状態の管理
export class AppState {
    static data: Readonly<Track[]> = []
    static playCountRecord: PlayCountRecord
    static loopMode: LoopMode = LocalStorage.loopMode
    static shuffleMode: ShuffleMode = LocalStorage.shuffleMode
}
