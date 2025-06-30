type Track = {
    title: string
    year: string
    author: string
    description: string
    path: string
    thumbnail: string
    tags: string[]
}

type PlayCountRecord = Readonly<{
    [title: string]: number
}>

type LoopMode = 0 | 1 | 2
type ShuffleMode = 0 | 1
