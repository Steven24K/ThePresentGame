import React from 'react'
import { Entity } from 'ts-lenses'


type ImageDropDownProps = {
    defaultValue: string
    urls: string[]
    iconSize: number | string
    onChange: (newValue: string) => void
}
type ImageDropDownState = {
    display: 'none' | 'block'
}

export default class ImageDropDown extends React.Component<ImageDropDownProps, ImageDropDownState> {
    constructor(props: ImageDropDownProps) {
        super(props)
        this.state = { display: 'none' }
    }

    triggerDropDown = (s: ImageDropDownState) => Entity(s).set('display', d => d == 'block' ? 'none' : 'block').commit()

    componentDidMount() {
        document.body.addEventListener('click', () => this.setState(s => Entity(s).set('display', _ => 'none' as 'none').commit()))
    }

    componentWillUnmount() {
        document.body.removeEventListener('click', () => this.setState(s => Entity(s).set('display', _ => 'none' as 'none').commit()))
    }
    
    render() {
        return <span>
            <span onClick={() => this.setState(this.triggerDropDown)} >
                <img height={this.props.iconSize} width={this.props.iconSize} src={this.props.defaultValue} />
            </span>
            <ul className='image-dropdown' style={{display: this.state.display}}>
                {this.props.urls.map(url => <li onClick={() => {
                    this.setState(s => Entity(s).set('display', _ => 'block' as 'block').commit())
                    this.props.onChange(url)
                }}><img src={url} height={this.props.iconSize} width={this.props.iconSize} /></li>)}
            </ul>
        </span>
    }
}