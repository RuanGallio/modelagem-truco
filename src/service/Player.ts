import { IPlayer, ICard, IDeck } from "../interfaces";
import { PlayerAction } from "../types";

export class Player implements IPlayer {
    private readonly deck: IDeck;
    public cards: ICard[] = [];
    public points: number = 0;

    constructor(public name: string, deckGenerator: IDeck) {
        this.deck = deckGenerator;
    }

    toString(): string {
        return this.name;
    }

    addPoints(points: number): void {
        this.points += points;
    }

    getPoints(): number {
        return this.points;
    }

    getCards(): ICard[] {
        return this.cards;
    }

    getManilha(): ICard {
        return this.deck.vira;
    }

    getCardsAsString(): string[] {
        return this.cards.map(card => card.toString());
    }

    hasCard(card: ICard): boolean {
        return this.cards.includes(card);
    }

    hasCardByValue(value: number): boolean {
        return this.cards.some(card => card.value === value);
    }

    hasManilha(): boolean {
        return this.hasCardByValue(this.deck.vira.value + 1);
    }

    [PlayerAction.PLAY_CARD](card: ICard): ICard {
        const index = this.cards.indexOf(card);
        if (index > -1) {
            return this.cards.splice(index, 1)[0];
        }
        throw new Error(`${this.toString()} does not have ${card}`);
    }

    [PlayerAction.TRUCO](num: number): void { }

}