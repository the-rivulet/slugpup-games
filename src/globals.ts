export let getId = (x: string) => document.getElementById(x) as HTMLElement;

export enum Stats {
    sympathy,
    bravery,
    energy,
    nervousness,
    aggression,
    dominance
}