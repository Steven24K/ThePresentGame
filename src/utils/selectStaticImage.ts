import { ActionKeys } from "../core/game";

export function selectStaticImage(action: ActionKeys): string {
    switch (action) {
        case "exchange":
            return 'images/swap.gif'
        case "give_left":
            return 'images/giveaway_left.gif'
        case "give_right":
            return 'images/giveaway_right.gif'
        case "giveaway":
            return  'images/giveaway.gif'
        case "go_left":
            return  'images/go_left.gif'
        case "go_right":
            return  'images/go_right.gif'
        case "oh no":
            return  'images/no.gif'
        case "present":
            return  'images/present.gif'
        case "steal":
            return  'images/steal.gif'
        case "steal_left":
            return  'images/steal_left.gif'
        case "steal_right":
            return  'images/steal_right.gif'
        case "turnaround":
            return  'images/turnaround.gif'
    }
}