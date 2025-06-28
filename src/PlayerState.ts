import { LocalStorage } from "./LocalStorage.js"

// グローバル状態の管理
export class PlayerState {
    // 元データ
    static data: Readonly<Track[]> = []
    static playCountRecord: Readonly<{
        [k: string]: number
    }> = {}

    static loopMode: LoopMode = LocalStorage.loopMode
    static shuffleMode: ShuffleMode = LocalStorage.shuffleMode

    static currentTrackIndex = 0
}

export type LoopMode = 0 | 1 | 2
export type ShuffleMode = 0 | 1
