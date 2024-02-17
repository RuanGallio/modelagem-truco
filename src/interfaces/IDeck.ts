import { ICard } from "./ICard";

export interface IDeck {
    cards: ICard[];
    vira: ICard;
    // setDeck(): void;
    toString(): string;
    deal(): ICard;
    compare(card1: ICard, card2: ICard): number;
    getWinnerCard(cards: ICard[]): ICard | undefined;
}