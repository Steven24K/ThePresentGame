import { Vector2d } from "konva/types/types"

export function positionShapesOnCircle(n: number, radius: number, circlePos: Vector2d): Vector2d[] {
    let result: Vector2d[] = []
    for (let i = 0; i < n; i++) {
        let angle = i * ((Math.PI * 2) / n)
        result.push({ x: Math.cos(angle) * radius + circlePos.x, y: Math.sin(angle) * radius + circlePos.y })
    }
    return result
}