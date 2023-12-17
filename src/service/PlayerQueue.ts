import { IPlayer, IPlayerQueue } from "../interfaces";

export class PlayerQueue implements IPlayerQueue {
    public players: IPlayer[] = [];

    constructor() { }

    createQueue(players: IPlayer[]): void {
        this.players = players;
    }

    addPlayer(player: IPlayer): void {
        this.players.push(player);
    }

    rotateQueue(): void {
        this.players.push(this.players.shift() as IPlayer);
    }

    getPlayerIndex(player: IPlayer): number {
        return this.players.indexOf(player);
    }

    peekNextPlayer(index: number): IPlayer {
        return this.players[index];
    }
}