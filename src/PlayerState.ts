import { LocalStorage } from "./LocalStorage.js"

// グローバル状態の管理
export class PlayerState {
    static data: Readonly<Track[]> = []
    static playCountRecord: PlayCountRecord
    static loopMode: LoopMode = LocalStorage.loopMode
    static shuffleMode: ShuffleMode = LocalStorage.shuffleMode
}

type PlayCountRecord = Readonly<{
    [title: string]: number
}>

export type LoopMode = 0 | 1 | 2
export type ShuffleMode = 0 | 1
