import { ICard, IDeck } from "../interfaces";
import { Suit } from "../types";
import { Card } from "./Card";

export class Deck implements IDeck {
    private suitOrder: Map<string, number> = new Map([
        ["♦", 1],
        ["♠", 2],
        ["♥", 3],
        ["♣", 4],
    ]);
    private cardOrder: Map<number, number> = new Map([
        [4, 1],
        [5, 2],
        [6, 3],
        [7, 4],
        [8, 5],
        [9, 6],
        [10, 7],
        [1, 8],
        [2, 9],
        [3, 10],
    ]);

    public cards: ICard[] = [];
    public vira: ICard = undefined as unknown as ICard;

    constructor() {

        for (let i = 1; i <= 10; i++) {
            for (let suit of Object.keys(Suit)) {
                this.cards.push(new Card(i, suit as Suit, false));
            }
        }
        this.shuffle();
        this.vira = this.cards[0];
        this.setManilhas();
    }

    toString(): string {
        return this.cards.toString();
    }

    getWinnerCard(cards: ICard[]): ICard {
        console.log('=== cards Deck.ts [45] ===', cards);
        return cards.reduce((card1, card2) => {
            console.log('=== card1, card2 Deck.ts [47] ===', card1, card2);
            return this.compare(card1, card2) === 1 ? card1 : card2;
        }
        );
    }

    deal(): ICard {
        return this.cards.pop() as ICard;
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

    // Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    private shuffle(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    private setManilhas(): void {
        this.cards = this.cards.map(card => {
            if (card.value === this.vira.value + 1) {
                card.isManilha = true;
            }
            return card;
        });
    }

    private compareByValue(card1: ICard, card2: ICard): number {
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

    private compareBySuit(card1: ICard, card2: ICard): boolean {
        return (
            (this.suitOrder.get(card1.suit) as number) >=
            (this.suitOrder.get(card2.suit) as number)
        );
    }
}