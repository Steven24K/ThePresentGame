export type Either<a, b> = {
    kind: 'left',
    value: a
} | {
    kind: 'right'
    value: b
}

export const InL = <a, b>(v: a): Either<a, b> => ({ kind: 'left', value: v })
export const InR = <a, b>(v: b): Either<a, b> => ({ kind: 'right', value: v })