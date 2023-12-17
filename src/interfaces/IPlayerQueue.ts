import { IPlayer } from "./IPlayer";

export interface IPlayerQueue {
    players: IPlayer[]
    createQueue: (players: IPlayer[]) => void
    addPlayer: (player: IPlayer) => void
    rotateQueue: () => void
    getPlayerIndex: (player: IPlayer) => number
    peekNextPlayer: (index: number) => IPlayer
}