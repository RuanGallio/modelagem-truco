import { TCard } from "../types";

export interface ICard {
    isManilha: boolean;
    value: number;
    suit: string;

    toString(): string;
}
