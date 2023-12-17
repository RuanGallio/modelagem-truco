import { ICard } from "./ICard";
import { IDeck } from "./IDeck";

export interface IPlayer {
    name: string;
    cards: ICard[];
    points?: number;
    toString(): string;
    playCard(card: ICard): ICard;
    truco(num: number): void;
    addPoints(points: number): void;
    getPoints(): number;
    getCards(): ICard[];
    getManilha(): ICard;
    getCardsAsString(): string[];
    hasCard(card: ICard): boolean;
    hasCardByValue(value: number): boolean;
    hasManilha(): boolean;
}