import React from 'react'
import { GameState, Option, None, Some } from '../game'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebook, faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faCopy } from '@fortawesome/free-solid-svg-icons'
import { giphy, storageKey } from '../../config'
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

    loadSavedGameState = (): Option<GameState> => localStorage.getItem(storageKey) == null ? None() : Some(JSON.parse(localStorage.getItem(storageKey)!))

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
                    <button disabled={this.loadSavedGameState().visit(() => false, () => true)} className='main-btn' onClick={() => this.loadSavedGameState().visit(game => this.props.update(game), () => { })}>Load Game</button>
                </div>
            </div>

            <div className='row'>
                <div className='col-6'>

                    <div className='dropdown right'>
                        <button className='share-btn'>Share</button>

                        <div className='dropdown-content'>
                            <a target="_blank" href="https://api.whatsapp.com/send?text=Play the present game">WhatsApp <FontAwesomeIcon icon={faWhatsapp}/></a>
                            <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http://example.org/">Facebook <FontAwesomeIcon icon={faFacebook}/></a>
                            <a target="_blank" href="#">Instagram <FontAwesomeIcon icon={faInstagram}/></a>
                            <a target="_blank" href="mailto:?subject=Play the present game&body=Do you want to play with me">E-Mail <FontAwesomeIcon icon={faEnvelope}/></a>
                            <a onClick={() => {
                                document.execCommand('copy')
                            }} href="#">Copy Link <FontAwesomeIcon icon={faCopy}/></a>
                        </div>
                    </div>

                </div>

                <div className='col-6'>

                    <div className='dropdown left'>
                        <button className='link-btn'>How to play?</button>

                        <div className='dropdown-content'>
                            <p>
                                TODO: WRITE INSTRUCTIONS
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    }
}