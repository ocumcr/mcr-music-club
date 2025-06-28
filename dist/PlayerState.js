import { LocalStorage } from "./LocalStorage.js";
// グローバル状態の管理
export class PlayerState {
    // 元データ
    static data = [];
    static playCountRecord = {};
    static loopMode = LocalStorage.loopMode;
    static shuffleMode = LocalStorage.shuffleMode;
}
