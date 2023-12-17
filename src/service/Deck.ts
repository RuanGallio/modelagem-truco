import { ICard, IDeck } from "../interfaces";
import { Suit } from "../types";
import { Card } from "./Card";

export class Deck implements IDeck {
    public cards: ICard[] = [];
    private suitOrder: Map<string, number>;
    private cardOrder: Map<string, number>;
    public vira: ICard;

    constructor() {
        this.suitOrder = new Map([
            ["♦", 1],
            ["♠", 2],
            ["♥", 3],
            ["♣", 4],
        ]);
        this.cardOrder = new Map([
            ['4', 1],
            ['5', 2],
            ['6', 3],
            ['7', 4],
            ['Q', 5],
            ['J', 6],
            ['K', 7],
            ['A', 8],
            ['2', 9],
            ['3', 10],
        ]);

        for (let i of Object.keys(this.cardOrder)) {
            for (let suit of Object.keys(Suit)) {
                this.cards.push(new Card(i, suit as Suit, false));
            }
        }
        this.shuffle();
        this.vira = this.cards[0];
        this.setManilhas();
    }

    setManilhas(): void {
        this.cards = this.cards.map(card => {
            if (card.value === this.vira.value + 1) {
                card.isManilha = true;
            }
            return card;
        });
    }

    toString(): string {
        return this.cards.toString();
    }

    getWinnerCard(cards: ICard[]): ICard {
        return cards.reduce((card1, card2) => {
            return this.compare(card1, card2) === 1 ? card1 : card2;
        }
        );
    }

    // Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal(): ICard {
        return this.cards.pop() as ICard;
    }


    compareByValue(card1: ICard, card2: ICard): number {
        const card1Value = this.cardOrder.get(card1.value) as number;
        const card2Value = this.cardOrder.get(card2.value) as number;

        if (card1Value > card2Value) {
            return 1;
        }
        if (card1Value < card2Value) {
            return -1;
        }
        return 0;
    }

    compareBySuit(card1: ICard, card2: ICard): boolean {
        return (
            (this.suitOrder.get(card1.suit) as number) >=
            (this.suitOrder.get(card2.suit) as number)
        );
    }

    compare(card1: ICard, card2: ICard): number {
        if (card1.isManilha && !card2.isManilha) {
            return 1;
        }
        if (!card1.isManilha && card2.isManilha) {
            return -1;
        }
        if (card1.isManilha && card2.isManilha) {
            return this.compareBySuit(card1, card2) ? 1 : -1;
        }
        return this.compareByValue(card1, card2);
    }
}