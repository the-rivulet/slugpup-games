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
document.onmousemove = function (e) {
    for (let i of document.getElementsByClassName("txt")) {
        i.style.top = (e.clientY + 30).toString();
        i.style.left = (e.clientX - 30).toString();
    }
};
export var Stat;
(function (Stat) {
    Stat["sympathy"] = "sympathy";
    Stat["bravery"] = "bravery";
    Stat["energy"] = "energy";
    Stat["nervousness"] = "nervousness";
    Stat["aggression"] = "aggression";
    Stat["dominance"] = "dominance";
})(Stat || (Stat = {}));
export var RelationType;
(function (RelationType) {
    RelationType["default"] = "default";
    RelationType["friends"] = "friends";
})(RelationType || (RelationType = {}));
export var DeathCause;
(function (DeathCause) {
    DeathCause["spearStab"] = "spear stab";
    DeathCause["spearThrow"] = "spear throw";
    DeathCause["grenadeExplosion"] = "grenade explosion";
})(DeathCause || (DeathCause = {}));
export var Item;
(function (Item) {
    Item["empty"] = "empty";
    Item["spear"] = "spear";
    Item["grenade"] = "grenade";
})(Item || (Item = {}));
export var Perk;
(function (Perk) {
    Perk["hasty"] = "hasty";
})(Perk || (Perk = {}));
