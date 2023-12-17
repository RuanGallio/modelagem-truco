import { TCard } from "../types";

export interface ICard {
    isManilha: boolean;
    value: string;
    suit: string;

    toString(): string;
}
