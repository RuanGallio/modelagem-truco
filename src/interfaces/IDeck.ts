import { ICard } from "./ICard";

export interface IDeck {
    cards: ICard[];
    vira: ICard;
    toString(): string;
    shuffle(): void;
    deal(): ICard;
    compare(card1: ICard, card2: ICard): number;
    compareByValue(card1: ICard, card2: ICard): number;
    compareBySuit(card1: ICard, card2: ICard): boolean;
    getWinnerCard(cards: ICard[]): ICard;
}