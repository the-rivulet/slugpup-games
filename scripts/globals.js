export let getId = (x) => document.getElementById(x);
export var Stats;
(function (Stats) {
    Stats[Stats["sympathy"] = 0] = "sympathy";
    Stats[Stats["bravery"] = 1] = "bravery";
    Stats[Stats["energy"] = 2] = "energy";
    Stats[Stats["nervousness"] = 3] = "nervousness";
    Stats[Stats["aggression"] = 4] = "aggression";
    Stats[Stats["dominance"] = 5] = "dominance";
})(Stats || (Stats = {}));
