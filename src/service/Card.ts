import { ICard } from "../interfaces";
import { Suit } from "../types";

export class Card implements ICard {

    constructor(
        public value: string,
        public suit: Suit,
        public isManilha: boolean = false
    ) {

        this.value = value;
        this.suit = suit;
        this.isManilha = isManilha;
    }

    toString(): string {
        return `${this.value} of ${this.suit}`;
    }

    isSameSuit(card1: ICard, card2: ICard): boolean {
        return card1.suit === card2.suit;
    }
}
