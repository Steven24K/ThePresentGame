/**
 * DEPRICATED
 */
export interface StateMachine {
    busy: boolean
    reset: () => void
    update: (fps: number) => void
}

export interface Done extends StateMachine {
    msg: string
}

export const Done = (msg: string): Done => ({
    busy: true,
    msg: msg,
    reset: function (): void {
        this.busy = true
    },
    update: function (): void {
        this.busy = false
    }
})

export interface Print extends StateMachine {
    msg: string
}

export const Print = (msg: string): Print => ({
    msg: msg,
    busy: true,
    reset: function (): void {
        this.busy = true
    },
    update: function (): void {
        console.log(this.msg)
        this.busy = false
    }
})


export interface Timer extends StateMachine {
    time: number
    init_time: number
}

export const Timer = (milliseconds: number): Timer => ({
    time: milliseconds,
    init_time: milliseconds,
    busy: true,
    reset: function (): void {
        this.busy = true
        this.time = this.init_time
    },
    update: function (fps: number): void {
        this.time -= fps
        if (this.time <= 0) {
            this.busy = false
        }
    }
})

export interface Wait extends StateMachine {
    condition: () => boolean
}

export const Wait = (condition: () => boolean): Wait => ({
    busy: true,
    condition: condition,
    reset: function (): void {
        this.busy = true
    },
    update: function (): void {
        if (condition()) {
            this.busy = false
        }
    }
})

export interface Seq extends StateMachine {
    curent: StateMachine
    next: StateMachine
    s1: StateMachine
    s2: StateMachine
}

export const Seq = (s1: StateMachine) => (s2: StateMachine): Seq => ({
    busy: true,
    curent: s1,
    next: s2,
    s1: s1,
    s2: s2,
    reset: function (): void {
        this.busy = true
        this.s1.reset()
        this.s2.reset()
        this.curent = this.s1
    },
    update: function (fps: number): void {
        if (this.busy) {
            this.curent.update(fps)
            if (!this.curent.busy) {
                this.curent = this.next
            }
            if (!this.next.busy) {
                this.busy = false
            }
        }
    }
})


export interface Repeat extends StateMachine {
    action: StateMachine
}

export const Repeat = (action: StateMachine): Repeat => ({
    busy: true,
    action: action,
    reset: function (): void {
        this.action.reset()
    },
    update: function (fps: number): void {
        if (!this.action.busy) {
            this.reset()
        }
        this.action.update(fps)
    }
})


export interface Call extends StateMachine {
    action: () => void
}

export const Call = (action: () => void): Call => ({
    action: action,
    busy: true,
    reset: function (): void {
        this.busy = true
    },
    update: function () {
        this.action()
        this.busy = true
    }
})

export interface CallIf extends StateMachine {
    action: () => void
    guard: () => boolean
}

export const CallIf = (guard: () => boolean) => (action: () => void): CallIf => ({
    busy: true,
    guard: guard,
    action: action,
    reset: function (): void {
        this.busy = true
    },
    update: function (): void {
        if (this.guard()) {
            this.action()
        }
        this.busy = false
    }
})


export interface StateMachineProcessor {
    proces: StateMachine
    run: (fps: number) => void
}

export const StateMachineProcessor = (proces: StateMachine): StateMachineProcessor => ({
    proces: proces,
    run: function (fps: number) {
        let run = setInterval(() => {
            this.proces.update(fps)
            if (!proces.busy) clearInterval(run)
        }, fps)
    }
})

// let proces: StateMachine = Seq(Print('Click'))(Seq(Timer(2000))(Seq(Print('Action!'))(Seq(Timer(2000))(Print('Done')))))

// let sm1 = StateMachineProcessor(proces)

//sm1.run(1)