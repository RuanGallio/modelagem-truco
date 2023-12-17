import { Truco, Deck, PlayerQueue } from "./service";

const truco = new Truco(new Deck(), new PlayerQueue());
truco.play();
