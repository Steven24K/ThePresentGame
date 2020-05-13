import React from 'react'
import { GameState } from '../game'

import { Grid } from '@giphy/react-components'
import { giphy } from '../../config'
import { Entity } from 'ts-lenses'

//import {image}  from './no.gif'

type StartScreenState = {
    images: string[]
}
type StartScreenProps = {
    gameState: GameState
    update: (g: GameState) => void
}
export default class StartScreen extends React.Component<StartScreenProps, StartScreenState> {
    constructor(props: StartScreenProps) {
        super(props)
        this.state = { images: [] }
    }

    componentWillMount() {
        giphy.search('present', { limit: 12 }).then(v => this.setState(s => Entity(s).set('images', _ => v.data.map(gif => gif.images.downsized.url)).commit()))
    }

    render() {
        return <div className='start-screen'>

            {this.state.images.map(v => <img width={50} height={50} src={v} key={v} />)}

            <div className='row'>
                <div className='col-12'>
                    <button className='main-btn' onClick={() => this.props.update(this.props.gameState.setGameScreen('setup'))}>New Game</button>
                </div>
            </div>

            <div className='row'>
                <div className='col-12'>
                    <button className='main-btn' onClick={() => this.props.update(this.props.gameState)}>Load Game</button>
                </div>
            </div>

            <div className='row'>
                <div className='col-6'>
                    <button className='share-btn right'>Share</button>
                </div>
                <div className='col-6'>
                    <button className='link-btn left'>How to play?</button>
                </div>
            </div>
        </div>
    }
}