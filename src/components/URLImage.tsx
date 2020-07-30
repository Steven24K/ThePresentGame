import React from 'react'
import { Image, Circle } from 'react-konva'
import { Option, None, Some } from '../core/game'
import { Entity } from 'ts-lenses'
import { KonvaEventObject } from 'konva/types/Node'

type URLImageProps = {
    src: string
    x: number
    y: number
    width: number
    height: number
    ref?: any
    draggable?: boolean
    stroke?: string
    strokeWidth?: number
    onDragEnd?: (evt: KonvaEventObject<DragEvent>) => void
}
type URLImageState = {
    image: Option<HTMLImageElement>
}
export default class URLImage extends React.Component<URLImageProps, URLImageState>{
    constructor(props: URLImageProps) {
        super(props)
        this.state = { image: None() }
    }

    loadImage = () => {
        let image = new window.Image()
        image.src = this.props.src
        this.setState(s => Entity(s).set('image', _ => Some(image)).commit())

    }

    componentDidMount() {
        this.loadImage()
    }

    render() {
        return this.state.image.visit(v => <Image image={v}
            x={this.props.x}
            y={this.props.y}
            ref={this.props.ref}
            width={this.props.width}
            height={this.props.height}
            onDragEnd={this.props.onDragEnd}
            stroke={this.props.stroke}
            strokeWidth={this.props.strokeWidth}
            draggable={this.props.draggable}
        />, () => <Circle radius={30} fill='red' x={this.props.x}
            y={this.props.y}
            onDragEnd={this.props.onDragEnd}
            stroke={this.props.stroke}
            strokeWidth={this.props.strokeWidth}
            draggable={this.props.draggable} />)
    }
}