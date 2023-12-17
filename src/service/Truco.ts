import * as readlineSync from 'readline-sync';
import { ICard, IDeck, IPlayer, IPlayerQueue } from "../interfaces";
import { GameMode, PlayerAction } from "../types";
import { Player } from "./Player";
import { TTeam } from '../types/TTeam';


export class Truco {
    private readonly MAX_POINTS = 12;
    private readonly CARDS_PER_PLAYER = 3;
    private deck: IDeck;
    private playerQueue: IPlayerQueue;
    private players: IPlayer[] = [];
    private playedCardsByRound: Map<number, ICard[]>;
    private gameMode: GameMode = GameMode.DUPLA;
    private gameModePlayerNumberMap: Map<GameMode, number>;

    public teams: TTeam[] = [];
    public round: number = 0;
    public roundPoints: number = 1;

    constructor(deckGenerator: IDeck, playerQueue: IPlayerQueue) {
        this.gameModePlayerNumberMap = new Map<GameMode, number>([
            [GameMode.SOLO, 1],
            [GameMode.DUPLA, 2],
        ]);
        this.playerQueue = playerQueue;
        this.playedCardsByRound = new Map<number, ICard[]>();
        this.deck = deckGenerator;
    }

    getManilha(): ICard {
        return this.deck.vira;
    }

    addPlayer(player: IPlayer): void {
        this.players.push(player);
    }

    addTeam(teamName: string): void {
        const playersPerTeam = this.gameModePlayerNumberMap.get(this.gameMode);

        if (!playersPerTeam) {
            throw new Error(`Invalid game mode: ${this.gameMode}`);
        }

        for (let i = 0; i < playersPerTeam; i++) {
            const playerName = readlineSync.question("What is your name?");
            const player = new Player(playerName, this.deck)

            const team = {
                name: teamName,
                players: [player],
                points: 0,
            } as TTeam;


            this.teams.push(team);

            this.addPlayer(player);
        }
    }


    deal(): void {
        for (let i = 0; i < this.CARDS_PER_PLAYER; i++) {
            for (let player of this.players) {
                const card = this.deck.deal();
                player.cards.push(card);
                // console.log(`${player} received ${this.deck.deal()}`);
            }
        }
    }

    // asks if next player accepts the truco
    truco(player: IPlayer): boolean {
        const nextPlayer = this.playerQueue.peekNextPlayer(this.playerQueue.getPlayerIndex(player));

        const truco = readlineSync.keyInSelect(['Yes', 'No'], `${nextPlayer.toString()}, do you accept the truco?`, { cancel: false });
        return truco === 0;
    }

    playersTurn(player: IPlayer, action: PlayerAction, card: ICard, num?: number): void {
        switch (action) {
            case PlayerAction.PLAY_CARD:
                const playedCard = player[PlayerAction.PLAY_CARD](card);

                const playedCards = this.playedCardsByRound.get(this.round) || [];
                this.playedCardsByRound.set(this.round, [...playedCards, playedCard]);

                console.info(`${player} played ${playedCard}`);
                break

            // TODO Implementar truco de modo que: Se aceitar, aumenta o valor da rodada;
            // Se não aceitar, o time que chamou ganha 1 ponto e a rodada acaba.
            case PlayerAction.TRUCO:
                const accepted = this.truco(player);


                if (num) {
                    this.roundPoints = num;
                }


                break;

            case PlayerAction.GET_CARDS:
                player[PlayerAction.GET_CARDS]();
                break;

            case PlayerAction.GET_MANILHA:
                player[PlayerAction.GET_MANILHA]();
                break;

            default:
                throw new Error(`Invalid action: ${action}`);
        }
    }

    chooseGameMode(): void {
        const gameMode = readlineSync.keyInSelect(Object.keys(GameMode), 'What game mode do you want to play?', { cancel: false });
        this.gameMode = Object.values(GameMode)[gameMode];
    }

    play(): void {

        this.chooseGameMode();

        for (let i = 0; i < 2; i++) {
            const teamName = readlineSync.question("What is your team name?");
            this.addTeam(teamName);
        }


        // if 4 players, change position from the second and third player
        if (this.players.length === 4) {
            [this.players[1], this.players[2]] = [this.players[2], this.players[1]]
        }

        this.playerQueue.createQueue(this.players);

        this.deal();

        console.info(`The manilha is ${this.getManilha()}`);

        while (!this.gameOver()) {
            this.playRound();
        }
        console.log(`Game over! ${this.getWinner().toString()} won!`);
    }

    gameOver(): boolean {
        return this.players.some(player => player.getPoints() >= this.MAX_POINTS);
    }

    getWinner(): IPlayer {
        return this.players.reduce((player1, player2) => {
            return player1.getPoints() > player2.getPoints() ? player1 : player2;
        });
    }

    playRound(): void {
        this.round++;
        this.deck.deal();
        const cardPlayerMap = new Map<ICard, IPlayer>();


        // TODO adicionar validação para, caso algum jogador vença 2 de tres rodadas, o jogo acaba

        for (let player of this.players) {

            const action = readlineSync.keyInSelect(Object.keys(PlayerAction), `${player}, what do you want to do?`, { cancel: false })
            console.log(`You have chosen ${Object.keys(PlayerAction)[action]}`);

            const actionName = Object.values(PlayerAction)[action];

            if (actionName === PlayerAction.EXIT) {
                process.exit(0);
            }

            const playerCards = player.getCardsAsString();
            if (playerCards.length === 0) {
                console.log(`${player} has no cards left!`);
                break;
            }

            const cardIndex = readlineSync.keyInSelect(playerCards, `${player}, what card do you want to play?`, { cancel: 'Exit' });
            if (cardIndex === -1) {
                process.exit(0);
            }

            const card = player.cards[cardIndex];
            cardPlayerMap.set(card, player);
            console.log(`You have chosen ${card}`);

            this.playersTurn(player, actionName, card);

            console.log(`Round ${this.round}!`);
        }

        this.playerQueue.rotateQueue();
        const roundWinner = this.getRoundWinner(cardPlayerMap);
        console.log(`${roundWinner} won round ${this.round}!`);
        roundWinner.addPoints(this.roundPoints);
    }

    getRoundWinner(cardPlayerMap: Map<any, any>): IPlayer {
        const cards = Array.from(cardPlayerMap.keys());
        const winnerCard = this.deck.getWinnerCard(cards);

        return cardPlayerMap.get(winnerCard)
    }
}