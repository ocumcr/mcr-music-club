import { LocalStorage } from "./LocalStorage.js";
// グローバル状態の管理
export class PlayerState {
    static data = [];
    static playCountRecord;
    static loopMode = LocalStorage.loopMode;
    static shuffleMode = LocalStorage.shuffleMode;
}
