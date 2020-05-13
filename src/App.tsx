import React from 'react'
import '../static/css/site.css'
import { ActionBuilderSettings } from './core/game'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import RainbowText from './components/RainbowText'
import Game from './core/components/Game'

// TODO Copy images to files
// https://medium.com/a-beginners-guide-for-webpack-2/copy-all-images-files-to-a-folder-using-copy-webpack-plugin-7c8cf2de7676
/**
 * TODO make a credits page: 
 * Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
 * Icons made by <a href="https://www.flaticon.com/authors/roundicons" title="Roundicons">Roundicons</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
 * 
 * 
 */

type GamePlaySettings = {
    autoPlay: boolean
    datafriendly: boolean
    soundVolume: number
    voiceOver: boolean
    music: boolean
}


type AppState = {
    actionSettings: ActionBuilderSettings
}
type AppProps = {}
export default class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props)
        this.state = {
            actionSettings: {
                turnArroundLoad: [0.1, 1],
                skipTurnLoad: [0.1, 0.7],
                present2LeftLoad: [0.1, 0.9],
                present2RightLoad: [0.1, 0.7],
                pickPresentLoad: [0, 1],
                stealPresentLoad: [0, 0.8],
                giveAwayLoad: [0, 1],

                swapLoad: [0, 1],
                stealFromLeftLoad: [0.4, 0.8],
                stealFromRightLoad: [0.4, 0.8],
                giveAwayToLeftLoad: [0.4, 0.8],
                giveAwayToRightLoad: [0.4, 0.8]

            }
        }
    }

    render() {
        return <div>
            <nav className='my-navbar'>
                <ul>
                    <li>Author</li>
                    <li>Download</li>
                    <li className='right'><FontAwesomeIcon icon={faCog} /></li>
                </ul>
            </nav>

            <div className='App'>

                <div className='row'>
                    <div className='col-12'>
                        <h1 className='main-title'>
                            <RainbowText text='The Present Game' />
                        </h1>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-12'>
                        <Game actionSettings={this.state.actionSettings} />
                    </div>
                </div>


            </div>

        </div>

    }
}

