// グローバル状態の管理
export class Record {
    static data: Readonly<Track[]> = []
    static playCountRecord: PlayCountRecord
}
