import React from 'react'
import { Entity } from 'ts-lenses'
import { GameState } from '../game'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretUp, faCaretDown, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import { Avatars } from '../../utils/avatars'
import ImageDropDown from '../../components/ImageDropDown'


type GameSetupState = {
    playerForm: { name: string }
}
type GameSetupProps = {
    gameState: GameState
    update: (g: GameState) => void
}
export default class GameSetup extends React.Component<GameSetupProps, GameSetupState> {
    constructor(props: GameSetupProps) {
        super(props)
        this.state = {
            playerForm: { name: '' }
        }
    }

    updatePlayerName = (newBalue: string) => (s: GameSetupState) => Entity(s).setIn('playerForm', f => f.set('name', _ => newBalue)).commit()

    render() {
        return <div className='game-setup'>

            <div className='row'>
                <div className='col-12'>

                    <input className='player-input' type='text' value={this.state.playerForm.name}
                        onChange={event => this.setState(this.updatePlayerName(event.currentTarget.value))}
                        onKeyDown={event => {
                            if (event.keyCode == 13) {
                                if (this.state.playerForm.name.trim() != '') {
                                    this.props.update(this.props.gameState.addPlayer(this.state.playerForm.name.trim()))
                                    this.setState(this.updatePlayerName(''))
                                }
                            }
                        }}
                    />

                    <button className='add-player-btn' onClick={() => {
                        if (this.state.playerForm.name.trim() != '') {
                            this.props.update(this.props.gameState.addPlayer(this.state.playerForm.name.trim()))
                            this.setState(this.updatePlayerName(''))
                        }
                    }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>

                </div>
            </div>

            <div className='row'>
                <div className='col-12'>

                    <ul className='player-list'>
                        {this.props.gameState.players.map((player, i) => <li key={player.name}>

                            <div className='row'>

                                <span className='col-8 player-name align-left'>
                                    {/* <img height='32px' width='32px' src={player.avatar.src} /> */}

                                    <ImageDropDown onChange={newURL => this.props.update(this.props.gameState.setPlayerAvatar(i, { src: newURL }))} defaultValue={player.avatar.src} iconSize='32px' urls={Avatars.map(avatar => avatar.src)} />

                                    {player.name}
                                </span>

                                <span className='col-4 align-right'>
                                    {i - 1 >= 0 ? <FontAwesomeIcon cursor='pointer' icon={faCaretUp} onClick={() => this.props.update(this.props.gameState.shiftPlayer(player, i - 1))} /> : <span></span>}

                                    {i + 1 < this.props.gameState.players.length ? <FontAwesomeIcon cursor='pointer' icon={faCaretDown} onClick={() => this.props.update(this.props.gameState.shiftPlayer(player, i + 1))} /> : <span></span>}

                                    <FontAwesomeIcon cursor='pointer' icon={faTrash} onClick={() => this.props.update(this.props.gameState.removePlayer(player.name))} />
                                </span>

                            </div>

                        </li>)}

                        {this.props.gameState.players.length == 0 ? <h3>Find people to play with!</h3> : <span></span>}
                    </ul>

                </div>
            </div>

            <div className='row'>
                <div className='col-12'>

                    <button className='main-btn' disabled={this.props.gameState.players.length < 3} onClick={() => this.props.update(this.props.gameState.setGameScreen('play'))}>
                        Play
                    </button>

                </div>
            </div>



        </div>
    }
}