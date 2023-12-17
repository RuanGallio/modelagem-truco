import { IPlayer } from "../interfaces"

export type TTeam = {
    name: string,
    players: IPlayer[],
    points: number,
}