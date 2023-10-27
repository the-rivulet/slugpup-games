import { Game } from "./game.js";
import { Stat, Item, choice, ActionData } from "./globals.js";

export interface SlugpupStats {
    sympathy: number;
    bravery: number;
    energy: number;
    nervousness: number;
    aggression: number;
    dominance: number;
}

export class Slugpup {
    name: string;
    stats: SlugpupStats;
    color: string;
    action: ActionData;
    item = Item.empty;
    kills = 0;
    dead = false;
    killedBy: Slugpup;
    hasInitiated = false;
    hasActed = false;
    constructor() {
        let s = {};
        for(let i of Object.keys(Stat)) s[i] = Math.random();
        this.stats = s as SlugpupStats;
    }
    bias(stat: Stat, weight: number) {
        return (this.stats[stat] - 50) * weight * 1/50;
    }
    selectAction() {
        if(this.dead) {
            this.action = {action: undefined, pups: []};
            return;
        }
        let pool: ActionData[] = [];
        for(let i of Game.actionPool) {
            let pups: Slugpup[] = [this];
            while(pups.length < i.pups) {
                let remain = Game.pups.filter(x => !x.dead && !pups.includes(x));
                pups.push(choice(remain));
            }
            if(i.req && !i.req(pups)) continue;
            let chance = i.chance + (i.bias(pups) || 0);
            while(chance > 0) {
                if(Math.random() < chance) pool.push({action: i, pups: pups});
                chance--;
            }
        }
        if(pool.length) this.action = choice(pool);
        else this.action = {action: undefined, pups: []};
    }
    relationshipWith(pup: Slugpup) {
        for(let i of Game.relationships) {
            if(i.source == this && i.target == pup) return i.type;
        }
    }
}