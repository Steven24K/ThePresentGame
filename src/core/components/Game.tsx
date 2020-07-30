import React from 'react'
import { ActionBuilderSettings, GameState, repeatUntil } from '../game'
import StartScreen from './StartScreen'
import GameSetup from './GameSetup'
import GamePlay from './GamePlay'
import { storageKey } from '../../config'

type GameProps = {
    actionSettings: ActionBuilderSettings
}
export default class Game extends React.Component<GameProps, GameState> {
    constructor(props: GameProps) {
        super(props)
        this.state = GameState()

        this.setGameState = this.setGameState.bind(this)
    }

    setGameState = (s: GameState) => {
        if (!Object.is(s, this.state)) localStorage.setItem(storageKey, JSON.stringify(s))
        this.setState(s)
    }

    componentDidMount() {
        //Uncomment this line to auto generate some users
        //this.setState(s => repeatUntil<[GameState, number]>(g => [g[0].addPlayer('Player ' + String(g[1])), g[1] += 1])(g => g[1] == 31)([s, 1])[0])
    }

    render() {
        switch (this.state.gameScreen) {
            case "start":
                return <StartScreen gameState={this.state} update={this.setGameState} />
            case "setup":
                return <GameSetup gameState={this.state} update={this.setGameState} />
            case "play":
                return <GamePlay gameState={this.state} update={this.setGameState} actionSettings={this.props.actionSettings} />
        }
    }
}