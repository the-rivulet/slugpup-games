export let getId = (x) => document.getElementById(x);
export function shuffle(a) {
    let array = a.slice(0);
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
export let choice = function (x) { return x[Math.floor(Math.random() * x.length)]; };
export let choiceStr = (x) => x[Math.floor(Math.random() * x.length)];
export let randomColor = () => "#" +
    choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") +
    choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef") + choiceStr("0123456789abcdef");
export var Stat;
(function (Stat) {
    Stat["sympathy"] = "sympathy";
    Stat["bravery"] = "bravery";
    Stat["energy"] = "energy";
    Stat["nervousness"] = "nervousness";
    Stat["aggression"] = "aggression";
    Stat["dominance"] = "dominance";
})(Stat || (Stat = {}));
export class Creature {
    name;
    color;
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}
export var RelationType;
(function (RelationType) {
    RelationType["default"] = "default";
    RelationType["friends"] = "friends";
    RelationType["swornEnemies"] = "sworn enemies";
})(RelationType || (RelationType = {}));
export var DeathCause;
(function (DeathCause) {
    DeathCause["backstab"] = "spear backstab";
    DeathCause["spearThrow"] = "spear throw";
    DeathCause["grenadeExplosion"] = "grenade explosion";
    DeathCause["suicide"] = "suicide";
    DeathCause["brawl"] = "brawl";
    DeathCause["lizard"] = "lizard bite";
    DeathCause["dropwig"] = "dropwig slash";
})(DeathCause || (DeathCause = {}));
export var Item;
(function (Item) {
    Item["empty"] = "empty";
    Item["spear"] = "spear";
    Item["grenade"] = "grenade";
    Item["pearl"] = "pearl";
})(Item || (Item = {}));
export var Perk;
(function (Perk) {
    Perk["hasty"] = "hasty";
    Perk["suicidal"] = "suicidal";
    Perk["tamedLizard"] = "tamed lizard";
    Perk["highRep"] = "good scavenger reputation";
    Perk["lowRep"] = "bad scavenger reputation";
})(Perk || (Perk = {}));
