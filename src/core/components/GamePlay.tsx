import React from 'react'
import { Stage, Layer, Group, Text } from 'react-konva'
import { Vector2d } from 'konva/types/types'
import { Option, GameState, ActionBuilderSettings, None, ActionBuilder, getRandomArbitrary, Some } from '../game'
import { Entity } from 'ts-lenses'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { giphy } from '../../config'

import { IGif } from '@giphy/js-types';
import { InL, InR } from '../../utils/Either'
import { selectStaticImage } from '../../utils/selectStaticImage'
import URLImage from '../../components/URLImage'




type GamePlayState = {
    actionResult: Option<[string, string, GameState]>
    image: Option<string>
    actionPressed: boolean
    playState: 'idle' | 'playing' | 'finished'

    canvasSettings: {
        layout: Vector2d[]
    }
}
type GamePlayProps = {
    gameState: GameState
    actionSettings: ActionBuilderSettings
    update: (g: GameState) => void
}
export default class GamePlay extends React.Component<GamePlayProps, GamePlayState> {
    constructor(props: GamePlayProps) {
        super(props)
        this.state = {
            playState: 'idle',
            image: None(),
            actionResult: None(),
            actionPressed: false,
            canvasSettings: {
                layout: []
            }
        }
    }

    componentWillMount() {
        this.setState(s => Entity(s).setIn('canvasSettings', c => c.set('layout', _ => this.props.gameState.drawPlayerCircle(190, { x: 200, y: 200 }))).commit())
    }

    render() {
        this.props.gameState.printgame()



        return <div className='game-play'>

            {
                this.props.gameState.EveryOneHasPresent() ? <h1>Yeaaah! Everyone has a present!</h1>
                    :
                    <span>
                        <button className='main-btn' disabled={this.state.actionPressed} onClick={() => {
                            // Select an action
                            let actions = ActionBuilder(this.props.gameState)(this.props.actionSettings)
                            let randomNumber = getRandomArbitrary(0, actions.length)
                            let action = actions[randomNumber]
                            let actionResult = action[1](this.props.gameState)

                            console.log('Probability: ' + (1 / actions.length) * 100 + '%')

                            // Animation + sound for selection 

                            // Set action (All this fancy checking is just in case the giphy api breaks)
                            giphy.search(action[0], { limit: 100, type: 'gifs', rating: 'g', sort: 'relevant', explore: true }).then(response => {
                                if (response.meta.status == 200) {
                                    return InL<IGif[], string>(response.data)
                                }
                                return InR<IGif[], string>(`Cannot reach giphy server... ${response.meta.msg}, Status code: ${response.meta.status}`)
                            }
                            ).then(result => {
                                if (result.kind == 'left') {
                                    if (result.value.length > 0) {
                                        this.setState(s => Entity(s)
                                            .set('image', _ => Some(result.value[getRandomArbitrary(0, result.value.length - 1)].images.downsized.url))
                                            .set('actionResult', _ => Some<[string, string, GameState]>([action[0], actionResult[0], actionResult[1]]))
                                            .set('actionPressed', _ => true)
                                            .commit())
                                        return result
                                    }
                                    return InR<IGif[], string>(`Cannot find search result for keyord: ${action[0]}`)
                                } // When right (or no response) load alt image
                                return result
                            }).catch((reason) => {
                                this.setState(s => Entity(s)
                                    .set('image', _ => Some(selectStaticImage(action[0])))
                                    .set('actionResult', _ => Some<[string, string, GameState]>([action[0], actionResult[0], actionResult[1]]))
                                    .set('actionPressed', _ => true)
                                    .commit())
                                return InR<IGif[], string>(`Cannot get response from giphy :: ${reason}`)
                            })
                        }}>
                            Go!
                </button>
                    </span>

            }

            <h2>It's <img height='64px' width='64px' src={this.props.gameState.getCurent().avatar.src} />{this.props.gameState.getCurent().name}'s turn</h2>

            {this.state.actionResult.kind != 'none' ? <div className='action-message'>
                <p>
                    {this.state.actionResult.value[1]}
                    <br />
                    {this.state.image.visit(v => <img src={v} className='gif-image' />, () => <div></div>)}
                </p>

                <button className='next-btn' onClick={() => {
                    this.setState(s => Entity(s).set('actionResult', _ => None<[string, string, GameState]>()).set('actionPressed', _ => false).commit())
                    //Start animation on canvas
                    this.props.update(this.state.actionResult.visit(v => v[2].setPrevActionId(v[0]).move(), () => this.props.gameState))
                }}>
                    Next
                </button>

            </div> : <div></div>}



            <div className='row'>

                <div className='col-12'>
                    <Stage className='game-simulator' height={400} width={400}>
                        <Layer ref='layer'>

                            {this.state.canvasSettings.layout.map((pos, i) => <Group key={i}>

                                <URLImage src={this.props.gameState.players[i].avatar.src} x={pos.x - 16} y={pos.y - 16} width={32} height={32} stroke={i == this.props.gameState.currentIndex ? 'orange' : ''} strokeWidth={3} />

                                {this.props.gameState.players[i].hasPresent ? <URLImage src='images/present.webp' x={pos.x - 16} y={pos.y + 5} height={32} width={32} /> : null}

                                <Text x={pos.x - 16} y={pos.y + 16} text={this.props.gameState.players[i].name} />

                            </Group>)}

                        </Layer>
                    </Stage>
                </div>

            </div>


            <h4>{Math.round(this.props.gameState.load() * 100)}% has a present</h4>

            <ol className='game-state-list'>
                {this.props.gameState.players.map((player, index) => <li key={index}>

                    <img height='16px' width='16px' src={player.avatar.src} />
                    <span className='player-name'>{player.name} </span>

                    {player.hasPresent ? <span> <img src='images/present.webp' height='25px' width='25px' /> </span> : <span> :( </span>}

                    {this.props.gameState.currentIndex == index ? <FontAwesomeIcon icon={faArrowLeft} /> : <span></span>}

                </li>)}
            </ol>


        </div>
    }
}