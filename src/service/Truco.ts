import * as readlineSync from 'readline-sync';
import { ICard, IDeck, IPlayer, IPlayerQueue } from "../interfaces";
import { GameMode, PlayerAction } from "../types";
import { Player } from "./Player";
import { TTeam } from '../types/TTeam';


type TRoundCardsPlayed = { round: number, cards: ICard[] };

export class Truco {
    private readonly MAX_POINTS = 12;
    private readonly CARDS_PER_PLAYER = 3;
    private deck: IDeck;
    private playerQueue: IPlayerQueue;
    private players: IPlayer[] = [];
    private playedCardsByRound: Map<number, ICard[]>;
    private playedCardsByHand: Map<number, TRoundCardsPlayed>;
    private gameMode: GameMode = GameMode.DUPLA;
    private gameModePlayerNumberMap: Map<GameMode, number>;
    private roundNumOfTruco: number = 0;

    public teams: TTeam[] = [];
    public round: number = 0;
    public hand: number = 0;
    public handPoints: number = 1;

    constructor(deckGenerator: IDeck, playerQueue: IPlayerQueue) {
        this.gameModePlayerNumberMap = new Map<GameMode, number>([
            [GameMode.SOLO, 1],
            [GameMode.DUPLA, 2],
        ]);
        this.playerQueue = playerQueue;
        this.playedCardsByRound = new Map<number, ICard[]>();
        this.playedCardsByHand = new Map<number, TRoundCardsPlayed>();
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

    getTeamByPlayer(player: IPlayer): TTeam {
        return this.teams.find(team => team.players.includes(player)) as TTeam;
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
    truco(player: IPlayer, num: number): { accepted: boolean, num: number } {
        const nextPlayer = this.playerQueue.peekNextPlayer(this.playerQueue.getPlayerIndex(player));

        const truco = readlineSync.keyInSelect(['Yes', 'No'], `${nextPlayer.toString()}, do you accept the truco ${3 * num}x?`);


        if (truco === 0) {
            console.log(`${nextPlayer} accepted the truco!`);
            num = this.truco(nextPlayer, num + 1).num
        } else {
            console.log(`${nextPlayer} declined the truco!`);
        }

        console.log(`Roda vale ${3 * num} pontos!`)
        return { accepted: truco === 0, num };
    }

    playersTurn(player: IPlayer): ICard | undefined {

        const action = readlineSync.keyInSelect(Object.keys(PlayerAction), `${player}, what do you want to do?`, { cancel: false })
        console.log(`You have chosen ${Object.keys(PlayerAction)[action]}`);

        const actionName = Object.values(PlayerAction)[action];

        const passiveActions = [PlayerAction.GET_CARDS, PlayerAction.GET_MANILHA];

        if (actionName === PlayerAction.EXIT) {
            process.exit(0);
        }

        const playerCards = player.getCardsAsString();
        if (playerCards.length === 0) {
            console.log(`${player} has no cards left!`);
            return;
        }

        let card = undefined as unknown as ICard;
        if (!passiveActions.includes(actionName)) {
            const cardIndex = readlineSync.keyInSelect(playerCards, `${player}, what card do you want to play?`, { cancel: 'Exit' });
            if (cardIndex === -1) {
                process.exit(0);
            }

            card = player.cards[cardIndex];
            console.log(`You have chosen ${card}`);
        }

        switch (actionName) {
            case PlayerAction.PLAY_CARD:
                const playedCard = player[PlayerAction.PLAY_CARD](card);


                const roundPlayedCards = this.playedCardsByRound.get(this.round) || [];
                this.playedCardsByRound.set(this.round, [...roundPlayedCards, card]);
                this.playedCardsByHand.set(this.hand, { round: this.round, cards: [...roundPlayedCards, playedCard] });

                console.info(`${player} played ${playedCard}`);
                return playedCard;
            // TODO Implementar truco de modo que: Se aceitar, aumenta o valor da rodada;
            // Se não aceitar, o time que chamou ganha 1 ponto e a rodada acaba.
            case PlayerAction.TRUCO:
                const { accepted, num } = this.truco(player, this.roundNumOfTruco || 1);

                if (accepted) {
                    this.handPoints = 3 * num;
                    this.roundNumOfTruco = num;
                } else {
                    const team = this.getTeamByPlayer(player);
                    team.points += 1;
                    this.roundNumOfTruco = 0;
                    return;
                }
                break;

            case PlayerAction.GET_CARDS:
                player[PlayerAction.GET_CARDS]();
                this.playersTurn(player);
                break;

            case PlayerAction.GET_MANILHA:
                player[PlayerAction.GET_MANILHA]();
                this.playersTurn(player);
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
            this.playHand();
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


    playHand(): void {
        this.handPoints = 1;
        this.playedCardsByRound.clear();

        let isHandOver = false;
        let winnerTeam: TTeam | null = null;

        const team_A = this.teams[0].name
        const team_B = this.teams[1].name
        const handWinners = {
            [team_A]: 0,
            [team_B]: 0,
        }

        while (!isHandOver) {
            const roundWinner = this.playRound();

            if (!roundWinner) {
                // add 1 point to each team so that it ends in the next round
                handWinners[team_A] += 1;
                handWinners[team_B] += 1;
                continue;
            }

            const handWinnerTeam = this.getTeamByPlayer(roundWinner);
            handWinnerTeam.points += this.handPoints;
            handWinners[handWinnerTeam.name] += 1;

            const winnerTeam = Object.values(handWinners).find(value => value === 2);

            if (!!winnerTeam) {
                isHandOver = true;
            }
        }

        console.log(`Hand over! ${winnerTeam} won this hand!`);

        this.playerQueue.rotateQueue();
        this.deal();
    }

    playRound(): IPlayer | undefined {
        this.round++;
        const cardPlayerMap = new Map<ICard, IPlayer>();

        for (let player of this.playerQueue.players) {

            const card = this.playersTurn(player);

            if (!card) {
                continue;
            }

            cardPlayerMap.set(card, player);

            console.log(`Round ${this.round}!`);
        }

        this.playerQueue.rotateQueue();
        const roundWinner = this.getRoundWinner(cardPlayerMap);
        console.log(`${roundWinner} won round ${this.round}!`);
        return roundWinner
    }

    getRoundWinner(cardPlayerMap: Map<any, any>): IPlayer | undefined {
        console.log('=== cardPlayerMap Truco.ts [280] ===', cardPlayerMap);
        const cards = Array.from(cardPlayerMap.keys());
        console.log('=== cards Truco.ts [281] ===', cards);
        const winnerCard = this.deck.getWinnerCard(cards);
        console.log('=== winnerCard Truco.ts [283] ===', winnerCard);

        if (!winnerCard) {
            return;
        }

        return cardPlayerMap.get(winnerCard)
    }
}