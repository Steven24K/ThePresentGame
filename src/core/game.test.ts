import { getRandomArbitrary, GameState, repeat } from "./game"




test('getRandomArbitrary number between 1 and 10', () => {
    expect(getRandomArbitrary(0, 10)).toBeLessThanOrEqual(10)
    expect(getRandomArbitrary(0, 10)).toBeGreaterThanOrEqual(0)
})

test('Test player counter', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.players.length).toBe(3)
})

test('Test getCurrent player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.getCurent().name).toBe('Steven')
    expect(myTestGame.move().move().move().getCurent().name).toBe('Steven')
})

test('Test getNext player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.getNextIndex()).toBe(1)
    expect(myTestGame.move().move().getNextIndex()).toBe(0)
    expect(myTestGame.move().getNextIndex()).toBe(2)
})

test('Test getPrev player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.getPrevIndex()).toBe(2)
    expect(myTestGame.move().move().getPrevIndex()).toBe(1)
    expect(myTestGame.move().getPrevIndex()).toBe(0)
})

test('Test presents in game', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.presentInGame()).toBe(false)
    expect(myTestGame.pickPresentForCurentPlayer().presentInGame()).toBe(true)
})

test('Everyone has present', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.EveryOneHasPresent()).toBe(false)
    expect(myTestGame.pickPresentForCurentPlayer().EveryOneHasPresent()).toBe(false)
    expect(repeat<GameState>(g => g.pickPresentForCurentPlayer().move())(3)(myTestGame).EveryOneHasPresent()).toBe(true)
})

test('get random player who has a present', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.getRandomPlayerWhoHasPresent().kind).toBe('none')
    expect(myTestGame.pickPresentForCurentPlayer().getRandomPlayerWhoHasNoPresent().kind).toBe('some')
})

test('test get random player who has no present', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.getRandomPlayerWhoHasNoPresent().kind).toBe('some')
})

test('set game screen', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.setGameScreen('play').gameScreen).toBe('play')
    expect(myTestGame.setGameScreen('setup').gameScreen).toBe('setup')
})

test('Test turn arround', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.turnArround().step).toBe(-1)
    expect(myTestGame.turnArround().turnArround().step).toBe(1)
})

test('Test present to left', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John').pickPresentForCurentPlayer()
    expect(myTestGame.presentToLeft().players.map(p => p.hasPresent)).toMatchObject([false, true, false])
})

test('test present to right', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John').pickPresentForCurentPlayer()
    expect(myTestGame.presentToRight().players.map(p => p.hasPresent)).toMatchObject([false, false, true])
})

test('Pick present for current player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
    expect(myTestGame.pickPresentForCurentPlayer().getCurent().hasPresent).toBe(true)
})

test('Put present back for current player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John').pickPresentForCurentPlayer()
    expect(myTestGame.putPresentBackForCurentPlayer().getCurent().hasPresent).toBe(false)
})

test('Give present away', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John').pickPresentForCurentPlayer().givePresentAwayTo(1)
    expect(myTestGame.players[1].hasPresent).toBe(true)
    expect(myTestGame.players[0].hasPresent).toBe(false)
})

test('steal present', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .pickPresentForCurentPlayer().move().stealPresent(0)

    expect(myTestGame.players[0].hasPresent).toBe(false)
    expect(myTestGame.players[1].hasPresent).toBe(true)
})

test('addPlayer', () => {
    let myTestGame = GameState()
    expect(myTestGame.players.length).toBe(0)
    expect(myTestGame.addPlayer('Bob').addPlayer('Foo').players.length).toBe(2)
    expect(myTestGame.addPlayer('Bob').addPlayer('Bob').players.length).toBe(1)
})

test('remove player', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')

    expect(myTestGame.removePlayer('John').players.length).toBe(2)
})

test('ShiftPlayer', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')

    expect(myTestGame.shiftPlayer(myTestGame.getCurent(), 2).players.map(v => v.name)).toMatchObject(['John', 'Bob', 'Steven'])
})


test('Swap', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .pickPresentForCurentPlayer().move().pickPresentForCurentPlayer()

    expect(myTestGame.swap(0).players.map(v => v.hasPresent)).toMatchObject([true, true, false])
})


test('stealFromRight', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .pickPresentForCurentPlayer().move()

    expect(myTestGame.stealFromRight().players.map(v => v.hasPresent)).toMatchObject([false, true, false])
})


test('stealFromLeft', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .move().pickPresentForCurentPlayer().move().move()

    expect(myTestGame.stealFromLeft().players.map(v => v.hasPresent)).toMatchObject([true, false, false])
})

test('giveToRight', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .move().pickPresentForCurentPlayer()

    expect(myTestGame.giveToRight().players.map(v => v.hasPresent)).toMatchObject([true, false, false])
})

test('giveToLeft', () => {
    let myTestGame = GameState().addPlayer('Steven').addPlayer('Bob').addPlayer('John')
        .pickPresentForCurentPlayer()

    expect(myTestGame.giveToLeft().players.map(v => v.hasPresent)).toMatchObject([false, true, false])
})