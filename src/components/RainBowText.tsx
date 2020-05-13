import React from 'react'

const rainbowColors = ['red', 'orange', 'yellow', 'green', 'lightblue', 'indigo', 'violet']

type RainBowTextProps = {
    text: string
}
type RainBowTextState = {}
export default class RainbowText extends React.Component<RainBowTextProps, RainBowTextState> {
    constructor(props: RainBowTextProps) {
        super(props)
        this.state = {}
    }

    render() {
        return <span>
            {
            this.props.text.split('').map((value, index) => <span key={index} style={{color: rainbowColors[index%rainbowColors.length]}}>
                {value}
            </span>)
            }
        </span>
    }
}