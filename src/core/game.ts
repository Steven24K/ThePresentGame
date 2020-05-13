import { Entity } from 'ts-lenses'
import { Vector2d } from 'konva/types/types'
import { Avatar, Avatars } from '../utils/avatars'

/**
* 3 sorts of actions: 
* - One when a player does not have a present 
*   1. Grab a present 
*   2. Steal a present from ... (Not possible when no one has a present)
* - One when a player does have a present 
*   3. Give present away to
* - One where it doesn't matter if the person has a present 
*   5. Turn the other way around, 
*   6. Everyone gives present to the right (only possible if at least 1 person has a present)
*   7. Everyone gives present to the left (only possible if at least 1 person has a present)
*   8. Skip turn
*/

export interface Player {
    name: string
    hasPresent: boolean
    avatar: Avatar
}

export function getRandomArbitrary(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min)
}

export type Fun<a, b> = (_: a) => b

export const Identity = <a>(): Fun<a, a> => x => x

export const then = <a, b, c>(f: Fun<a, b>) => (g: Fun<b, c>): Fun<a, c> => (a: a) => g(f(a))
//f.repeat(4)
export const repeat = <a>(f: Fun<a, a>) => (n: number): Fun<a, a> => n <= 0 ? Identity() : then<a, a, a>(f)(repeat(f)(n - 1))

// f.repeatUntil(x => x == 5)
export const repeatUntil = <a>(f: Fun<a, a>) => (predicate: Fun<a, boolean>): Fun<a, a> => a => predicate(a) ? Identity<a>()(a) : then<a, a, a>(f)(repeatUntil(f)(predicate))(a)


export type Option<T> = ({
    kind: 'some'
    value: T
} | {
    kind: 'none'
}) & {
    visit: <U>(onSome: (v: T) => U, onNone: () => U) => U
}


export const Some = <T>(v: T): Option<T> => ({
    kind: 'some',
    value: v,
    visit: function <U>(onSome: (v: T) => U, onNone: () => U): U {
        return onSome(this.value)
    }
})


export const None = <T>(): Option<T> => ({ kind: 'none', visit: <U>(onSome: (v: T) => U, onNone: () => U): U => onNone() })



export type GameAction = [ActionKeys, Fun<GameState, [string, GameState]>]
export type ActionKeys = 'turnaround' | 'oh no' | 'go_left' | 'go_right' | 'present' | 'steal' | 'giveaway' | 'exchange' | 'steal_right' | 'steal_left' | 'give_left' | 'give_right'

// GameState: prevAction not turnArround, Load:  <80% 
const turnArround: GameAction = ['turnaround', game => ['Turn the other way around', game.turnArround()]]
// GameState: Dont Care, Load: >0% and <50%
const skipTurn: GameAction = ['oh no', game => ['Skip 1 turn', game]]

// GameSate: Attleast 1 present, prevAction not present2Left or present2Right, Load: >10% and <70%
const present2Left: GameAction = ['go_left', game => ['Everyone give your present to the person on your left', game.presentToLeft()]]
const present2Right: GameAction = ['go_right', game => ['Everyone give your present to the person on your right', game.presentToRight()]]

// GameState: player does not have a present, Load: <100%
const pickPresent: GameAction = ['present', game => ['Pick a present from the pile', game.pickPresentForCurentPlayer()]]

// GameSate: player does not have present and atleast one present in game, Load > 10%
const stealPresent: GameAction = ['steal', game => {
    let randomPlayer = game.getRandomPlayerWhoHasPresent()
    return [randomPlayer.visit(v => `Steal a present from ${v[1].name}`, () => 'Skip 1 turn :('), randomPlayer.visit(v => game.stealPresent(v[0]), () => game)]
}]

// GameSate: Player should have a present, Load: Any
const giveAway: GameAction = ['giveaway', game => {
    let randomPlayer = game.getRandomPlayerWhoHasNoPresent()
    return [randomPlayer.visit(v => `Give your present away to ${v[1].name}`, () => 'Skip 1 turn :('), randomPlayer.visit(v => game.givePresentAwayTo(v[0]), () => game)]
}]

const swapPresent: GameAction = ['exchange', game => {
    let randomPlayer = game.getRandomPlayerWhoHasPresent()
    return [randomPlayer.visit(v => `Swap presents with ${v[1].name}`, () => 'Skip 1 turn :('), randomPlayer.visit(v => game.swap(v[0]), () => game)]
}]
const stealFromRight: GameAction = ['steal_right', game => ['Steal a present from your right neigbor', game.stealFromRight()]]
const stealFromLeft: GameAction = ['steal_left', game => ['Steal a present from your left neigbor', game.stealFromLeft()]]
const giveAwayToRight: GameAction = ['give_right', game => ['Give your present to your right neigbor', game.giveToRight()]]
const giveAwayToLeft: GameAction = ['give_left', game => ['Give your present to your left neigbor', game.giveToLeft()]]


type MinMaxLoad = [number, number]

export interface ActionBuilderSettings {
    turnArroundLoad: MinMaxLoad
    skipTurnLoad: MinMaxLoad
    present2LeftLoad: MinMaxLoad
    present2RightLoad: MinMaxLoad
    pickPresentLoad: MinMaxLoad
    stealPresentLoad: MinMaxLoad
    giveAwayLoad: MinMaxLoad

    swapLoad: MinMaxLoad
    stealFromRightLoad: MinMaxLoad
    stealFromLeftLoad: MinMaxLoad
    giveAwayToRightLoad: MinMaxLoad
    giveAwayToLeftLoad: MinMaxLoad
}


export const ActionBuilder = (game: GameState) => (settings: ActionBuilderSettings): GameAction[] => {
    let result: GameAction[] = []
    let load = game.load()

    if (game.prevActionId != 'turnaround' && settings.turnArroundLoad[0] <= load && load <= settings.turnArroundLoad[1]) {
        result.push(turnArround)
    }

    if (settings.skipTurnLoad[0] <= load && load <= settings.skipTurnLoad[1]) {
        result.push(skipTurn)
    }

    if (game.presentInGame() && game.prevActionId != 'go_right' && settings.present2LeftLoad[0] <= load && load <= settings.present2LeftLoad[1]) {
        result.push(present2Left)
    }

    if (game.presentInGame() && game.prevActionId != 'go_left' && settings.present2RightLoad[0] <= load && load <= settings.present2RightLoad[1]) {
        result.push(present2Right)
    }

    if (!game.getCurent().hasPresent && game.presentInGame() && settings.stealPresentLoad[0] <= load && load <= settings.stealPresentLoad[1]) {
        result.push(stealPresent)
    }

    if (!game.getCurent().hasPresent && settings.pickPresentLoad[0] <= load && load <= settings.pickPresentLoad[1]) {
        result.push(pickPresent)
    }

    if (game.getCurent().hasPresent && settings.giveAwayLoad[0] <= load && load <= settings.giveAwayLoad[1]) {
        result.push(giveAway)
    }

    if (game.getCurent().hasPresent && game.players.map(p => p.hasPresent).filter(b => b).length >= 2 && settings.swapLoad[0] <= load && load <= settings.swapLoad[1]) {
        result.push(swapPresent)
    }

    if (!game.getCurent().hasPresent && game.players[game.getNextIndex()].hasPresent && settings.stealFromLeftLoad[0] <= load && load <= settings.stealFromLeftLoad[1]) {
        result.push(stealFromLeft)
    }

    if (!game.getCurent().hasPresent && game.players[game.getPrevIndex()].hasPresent && settings.stealFromRightLoad[0] <= load && load <= settings.stealFromRightLoad[1]) {
        result.push(stealFromRight)
    }

    if (game.getCurent().hasPresent && !game.players[game.getNextIndex()].hasPresent && settings.giveAwayToLeftLoad[0] <= load && load <= settings.giveAwayToLeftLoad[1]) {
        result.push(giveAwayToLeft)
    }

    if (game.getCurent().hasPresent && !game.players[game.getPrevIndex()].hasPresent && settings.giveAwayToRightLoad[0] <= load && load <= settings.giveAwayToRightLoad[1]) {
        result.push(giveAwayToRight)
    }

    return result
}



type GameScreens = 'start' | 'setup' | 'play'

export interface GameState {
    players: Player[]
    currentIndex: number
    step: number
    gameScreen: GameScreens
    prevActionId: string

    setPlayerAvatar: (this: GameState, playerIndex: number, newAvatar: Avatar) => GameState

    getCurent: (this: GameState) => Player
    getNextIndex: (this: GameState) => number
    getPrevIndex: (this: GameState) => number

    move: (this: GameState) => GameState

    presentInGame: (this: GameState) => boolean
    EveryOneHasPresent: (this: GameState) => boolean

    getRandomPlayerWhoHasPresent: (this: GameState) => Option<[number, Player]>
    getRandomPlayerWhoHasNoPresent: (this: GameState) => Option<[number, Player]>
    stealPresent: (this: GameState, playerIndex: number) => GameState

    setGameScreen: (this: GameState, screen: GameScreens) => GameState
    setPrevActionId: (this: GameState, actionId: string) => GameState

    turnArround: (this: GameState) => GameState
    presentToLeft: (this: GameState) => GameState
    presentToRight: (this: GameState) => GameState
    pickPresentForCurentPlayer: (this: GameState) => GameState
    putPresentBackForCurentPlayer: (this: GameState) => GameState
    givePresentAwayTo: (this: GameState, playerIndex: number) => GameState
    swap: (this: GameState, playerIndex: number) => GameState
    stealFromRight: (this: GameState) => GameState
    stealFromLeft: (this: GameState) => GameState
    giveToRight: (this: GameState) => GameState
    giveToLeft: (this: GameState) => GameState

    addPlayer: (this: GameState, name: string) => GameState
    removePlayer: (name?: string) => GameState
    shiftPlayer: (player: Player, to: number) => GameState

    load: (this: GameState) => number

    drawPlayerCircle: (this: GameState, radius: number, centerPos: Vector2d) => Vector2d[]

    printgame: (this: GameState) => void
}

export const GameState = (): GameState => ({
    players: [],
    currentIndex: 0,
    step: 1,
    gameScreen: 'start',
    prevActionId: 'none',

    setPlayerAvatar: function(this: GameState, playerIndex: number, newAvatar: Avatar): GameState {
        return Entity(this).set('players', p => {
            p[playerIndex].avatar = newAvatar
            return p
        }).commit()
    },

    getCurent: function (this: GameState): Player {
        return this.players[this.currentIndex]
    },

    getNextIndex: function (this: GameState): number {
        if (this.currentIndex + 1 < this.players.length) {
            return this.currentIndex + 1
        }
        return 0
    },

    getPrevIndex: function (this: GameState): number {
        if (this.currentIndex - 1 >= 0) {
            return this.currentIndex - 1
        }
        return this.players.length - 1
    },

    pickPresentForCurentPlayer: function (this: GameState) {
        return Entity(this).set('players', p => {
            p[this.currentIndex].hasPresent = true
            return p
        }).commit()
    },

    presentInGame: function (this: GameState): boolean {
        return this.players.reduce<boolean>((xs, x) => xs || x.hasPresent, false)
    },

    EveryOneHasPresent: function (this: GameState): boolean {
        return this.players.reduce<boolean>((xs, x) => xs && x.hasPresent, true)
    },

    getRandomPlayerWhoHasPresent: function (this: GameState): Option<[number, Player]> {
        if (this.presentInGame()) {
            let presentPlayers = this.players.map<[number, Player]>((player, index) => [index, player]).filter(player => player[1].hasPresent && player[0] != this.currentIndex)
            let randomIndex = getRandomArbitrary(0, presentPlayers.length - 1)
            return Some(presentPlayers[randomIndex])
        }
        return None()
    },

    getRandomPlayerWhoHasNoPresent: function (this: GameState): Option<[number, Player]> {
        if (this.EveryOneHasPresent()) {
            return None()
        }
        let noPresentPlayers = this.players.map<[number, Player]>((player, index) => [index, player]).filter(player => !player[1].hasPresent && player[0] != this.currentIndex)
        let randomIndex = getRandomArbitrary(0, noPresentPlayers.length - 1)
        return Some(noPresentPlayers[randomIndex])
    },

    stealPresent: function (this: GameState, playerIndex: number): GameState {
        if (!this.getCurent().hasPresent) {
            return Entity(this).set('players', p => {
                p[playerIndex].hasPresent = false
                p[this.currentIndex].hasPresent = true
                return p
            }).commit()
        }
        return this
    },

    givePresentAwayTo: function (this: GameState, playerIndex: number): GameState {
        if (this.getCurent().hasPresent) {
            return Entity(this).set('players', p => {
                p[playerIndex].hasPresent = true
                p[this.currentIndex].hasPresent = false
                return p
            }).commit()
        }
        return this
    },

    swap: function (this: GameState, playerIndex: number): GameState {
        return Entity(this).set('players', p => {
            let tmp = p[playerIndex]
            p[playerIndex] = { ...p[playerIndex], hasPresent: this.getCurent().hasPresent }
            p[this.currentIndex] = { ...p[this.currentIndex], hasPresent: tmp.hasPresent }
            return p
        }).commit()
    },

    stealFromLeft: function (this: GameState): GameState {
        if (!this.getCurent().hasPresent && this.players[this.getNextIndex()].hasPresent) {
            return this.swap(this.getNextIndex())
        }
        return this
    },

    stealFromRight: function (this: GameState): GameState {
        if (!this.getCurent().hasPresent && this.players[this.getPrevIndex()].hasPresent) {
            console.log('executed')
            return this.swap(this.getPrevIndex())
        }
        console.log('Not executed')
        return this
    },

    putPresentBackForCurentPlayer: function (this: GameState): GameState {
        return Entity(this).set('players', p => {
            p[this.currentIndex].hasPresent = false
            return p
        }).commit()
    },

    move: function (this: GameState): GameState {
        return Entity(this).set('currentIndex', index => {
            index += this.step
            if (index > this.players.length - 1) {
                return 0
            } else if (index < 0) {
                return this.players.length - 1
            }
            return index
        }).commit()
    },

    setGameScreen: function (this: GameState, screen: GameScreens): GameState {
        return Entity(this).set('gameScreen', _ => screen).commit()
    },

    setPrevActionId: function (this: GameState, actionId: string): GameState {
        return Entity(this).set('prevActionId', _ => actionId).commit()
    },

    turnArround: function (this: GameState): GameState {
        return Entity(this).set('step', x => -x).commit()
    },

    presentToRight: function (this: GameState): GameState {
        return Entity(this).set('players', p => {
            let presents = p.map(v => v.hasPresent)
            let first = presents.shift()
            if (first != undefined) presents = presents.concat(first)
            return p.map((v, i) => Entity(v).set('hasPresent', _ => presents[i]).commit())
        }).commit()
    },

    presentToLeft: function (this: GameState): GameState {
        return Entity(this).set('players', p => {
            let presents = p.map(v => v.hasPresent)
            let last = presents.pop()
            if (last != undefined) presents = [last].concat(presents)
            return p.map((v, i) => Entity(v).set('hasPresent', _ => presents[i]).commit())
        }).commit()
    },

    giveToRight: function (this: GameState): GameState {
        if (this.getCurent().hasPresent && !this.players[this.getPrevIndex()].hasPresent) {
            return this.swap(this.getPrevIndex())
        }
        return this
    },

    giveToLeft: function (this: GameState): GameState {
        if (this.getCurent().hasPresent && !this.players[this.getNextIndex()].hasPresent) {
            return this.swap(this.getNextIndex())
        }
        return this
    },

    addPlayer: function (this: GameState, name: string): GameState {
        return Entity(this).set('players', p => p.findIndex(v => v.name == name) == -1 ? p.concat({ name: name, hasPresent: false, avatar: Avatars[getRandomArbitrary(0, Avatars.length)] }) : p).commit()
    },

    removePlayer: function (this: GameState, name?: string): GameState {
        if (name == undefined) {
            return Entity(this).set('players', p => {
                p.shift()
                return p
            }).commit()
        }
        return Entity(this).set('players', p => p.reduce((xs, x) => x.name == name ? xs : xs.concat(x), Array<Player>())).commit()

    },

    shiftPlayer: function (this: GameState, player: Player, to: number): GameState {
        let pIndex = this.players.findIndex(p => p.name == player.name)
        if (pIndex >= 0 && to < this.players.length) {
            let otherP = this.players[to]
            return Entity(this).set('players', p => {
                p[to] = player
                p[pIndex] = otherP
                return p
            }).commit()
        }
        return this
    },

    load: function (this: GameState): number {
        return this.players.filter(p => p.hasPresent).length / this.players.length
    },

    drawPlayerCircle: function (this: GameState, radius: number, centerPos: Vector2d): Vector2d[] {
        let result: Vector2d[] = []

        this.players.forEach((player, index) => {
            let angle = index * ((Math.PI * 2) / this.players.length)
            result.push({ x: Math.cos(angle) * radius + centerPos.x, y: Math.sin(angle) * radius + centerPos.y })
        })

        return result
    },

    printgame: function (this: GameState): void {
        console.log(`____GAME SUMMARY _______
        Players amount: ${this.players.length}
        PrevIndex: ${this.getPrevIndex()}
        currentIndex: ${this.currentIndex}
        NextIndex: ${this.getNextIndex()}
        currentPLayer: ${this.getCurent().name}
        step size: ${this.step}
        Load: ${this.load()}
        Last Action: ${this.prevActionId}
        GameScreen: ${this.gameScreen}
        `)

        console.table(this.players)
    }
})
