import { Game } from "./game.js";
import { Stat, Item, choice, ActionData, DeathCause, RelationType, Perk } from "./globals.js";

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
    perks: Perk[] = [];
    kills = 0;
    dead = false;
    deathCause: DeathCause;
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
    dodge(weight: number) {
        let multi = 1;
        if(this.perks.includes(Perk.hasty)) multi *= 2;
        return multi * (this.bias(Stat.nervousness, weight) + this.bias(Stat.aggression, weight));
    }
    attack(attackWeight: number, dodgeWeight = 0, ...targets: Slugpup[]) {
        let multi = 1;
        if(targets.filter(x => this.relationWith(x).shared == RelationType.friends)) multi *= 0.1;
        return multi * (this.bias(Stat.sympathy, -1 * attackWeight) + this.bias(Stat.aggression, attackWeight) + targets.reduce((p, c) => p + c.dodge(dodgeWeight), 0));
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
            let chance = i.chance + (i.bias ? i.bias(pups) : 0);
            while(chance > 0) {
                if(Math.random() < chance) pool.push({action: i, pups: pups});
                chance--;
            }
        }
        if(pool.length) this.action = choice(pool);
        else this.action = {action: undefined, pups: []};
    }
    relationWith(pup: Slugpup) {
        let forth = RelationType.default, back = RelationType.default;
        for(let i of Game.relations.filter(x => x.type != RelationType.default)) {
            if(i.source == this && i.target == pup) forth = i.type;
            if(i.source == pup && i.target == this) back = i.type;
        }
        return {
            forth: forth, back: back,
            shared: back == forth ? forth : RelationType.default,
            either: forth == RelationType.default ? back : forth
        };
    }
    relationIs(pup: Slugpup, relation: RelationType) {
        return this.relationWith(pup).forth == relation || this.relationWith(pup).back == relation;
    }
    become(relationship: RelationType, pup: Slugpup, twoWay = false) {
        Game.relations = Game.relations.filter(x => x.source != this || x.target != pup);
        Game.relations.push({source: this, target: pup, type: relationship});
        if(twoWay) pup.become(relationship, this);
    }
    die(cause: DeathCause, killer: Slugpup) {
        this.dead = true;
        this.deathCause = cause;
        this.killedBy = killer;
        if(killer) killer.kills++;
    }
}