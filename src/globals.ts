import type { Slugpup } from "./slugpup.js";

export let getId = (x: string) => document.getElementById(x) as HTMLElement;
export function shuffle<T>(a: T[]): T[] {
    let array = a.slice(0);
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
export let choice = function<T>(x: T[]): T {return x[Math.floor(Math.random() * x.length)];}
export let choiceStr = (x: string) => x[Math.floor(Math.random() * x.length)];
export let randomColor = () => "#" +
    choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") +
    choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef");

document.onmousemove = function(e) {
    for(let i of document.getElementsByClassName("txt")) {
        (i as HTMLElement).style.top = (e.clientY + 30).toString();
        (i as HTMLElement).style.left = (e.clientX - 30).toString();
    }
}

export enum Stat {
    sympathy = "sympathy",
    bravery = "bravery",
    energy = "energy",
    nervousness = "nervousness",
    aggression = "aggression",
    dominance = "dominance"
}

export interface ActionData {
    action: Action;
    pups: Slugpup[];
}

export interface Action {
    pups: number;
    text: string;
    chance: number;
    bias?: (pups: Slugpup[]) => number;
    req?: (pups: Slugpup[]) => boolean;
    effect?: (pups: Slugpup[]) => void;
}

export enum RelationType {
    default = "default",
    friends = "friends"
}

export interface Relation {
    source: Slugpup;
    target: Slugpup;
    type: RelationType;
}

export enum DeathCause {
    spearStab = "spear stab",
    spearThrow = "spear throw",
    grenadeExplosion = "grenade explosion"
}

export enum Item {
    empty = "empty",
    spear = "spear",
    grenade = "grenade"
}

export enum Perk {
    hasty = "hasty"
}