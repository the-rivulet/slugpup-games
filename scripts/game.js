import { getId, Stat, Item, shuffle, DeathCause, RelationType, Perk } from "./globals.js";
export class Game {
    static round = 0;
    static pups = [];
    static relations = [];
    static actionPool = [
        // Idle
        { pups: 1, text: "[0] looks for more items.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1) },
        { pups: 1, text: "[0] takes a quick nap.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.4) },
        { pups: 1, text: "[0] sees some weapons on the ground but ignores them.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, -0.1) + t[0].bias(Stat.sympathy, 0.1) + t[0].bias(Stat.dominance, -0.05) },
        { pups: 2, text: "[0] thinks about killing [1].", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1) },
        { pups: 1, text: "[0] looks for another slugpup to follow.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, -0.1) },
        { pups: 1, text: "[0] paces the arena nervously.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1) },
        { pups: 1, text: "[0] is confident they can win.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, -0.1) },
        { pups: 2, text: "[0] is unafraid of [1].", chance: 0.1, bias: t => t[0].bias(Stat.bravery, 0.1) + t[0].bias(Stat.sympathy, 0.1) },
        { pups: 2, text: "[0] looks at [1]'s weaponry with concern.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1), req: t => t[1].item == Item.spear || t[1].item == Item.grenade },
        // Item Idle
        { pups: 1, text: "[0] wishes they had something to defend themselves with.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.05), req: t => t[0].item == Item.empty },
        // Friend Idle
        { pups: 2, text: "[0] and [1] practice their teamwork.", chance: 0.1, req: t => t[0].relationWith(t[1]).shared == RelationType.friends },
        // -- Current sum of idles: dominance 0, energy -0.1, sympathy 0.1, aggression 0, nervousness 0.1, bravery 0.1
        // Friendship
        { pups: 2, text: "[0] asks [1] if they can be friends. [1] gratefully accepts.", chance: 0.5, bias: t => t[0].bias(Stat.sympathy, 0.35) + t[1].bias(Stat.sympathy, 0.35) + t[1].bias(Stat.nervousness, -0.2), req: t => !t[0].relationIs(t[1], RelationType.friends), effect: t => { t[0].become(RelationType.friends, t[1], true); } },
        { pups: 2, text: "[0] apologizes to [1], who forgives them.", chance: 0.5, bias: t => t[0].bias(Stat.sympathy, 0.35) + t[1].bias(Stat.sympathy, 0.35), req: t => { let x = t[0].relationWith(t[1]); return x.forth == RelationType.friends && x.back != RelationType.friends; }, effect: t => { t[1].become(RelationType.friends, t[0]); } },
        { pups: 2, text: "[0] asks [1] if they can be friends, but [1] politely declines.", chance: 0.5, bias: t => t[0].bias(Stat.sympathy, 0.35) + t[1].bias(Stat.sympathy, -0.35) + t[1].bias(Stat.nervousness, 0.2), req: t => !t[0].relationIs(t[1], RelationType.friends) },
        { pups: 2, text: "[0]'s badly aimed rock hits [1]. [1] reconsiders their friendship with [0].", chance: 0.2, bias: t => t[0].bias(Stat.energy, 0.1) + t[0].attack(-0.1), req: t => t[1].relationIs(t[0], RelationType.friends), effect: t => { t[1].become(RelationType.default, t[0]); } },
        // Perks
        { pups: 1, text: "[0] finds a mushroom and eats it. They feel their senses heighten.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.08), req: t => !t[0].perks.includes(Perk.hasty), effect: t => { t[0].perks.push(Perk.hasty); } },
        // Pickups
        { pups: 1, text: "[0] picks up a wicked-looking spear.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.aggression, 0.25), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 2, text: "[0] picks up a spear that [1] mistook for a piece of rubbish.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.aggression, 0.25), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 1, text: "[0] finds a grenade.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.08) + t[0].bias(Stat.aggression, 0.1), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.grenade; } },
        // Item Kills
        { pups: 2, text: "[0] fires a spear straight at [1]'s head, killing them instantly.", chance: 0.5, bias: t => t[0].attack(0.4, -0.25, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.spearThrow, t[0]); } },
        { pups: 2, text: "[0] sneaks up behind [1] and stabs them.", chance: 0.3, bias: t => t[0].attack(0.2, 0, t[1]) + t[1].bias(Stat.energy, 0.1), req: t => t[0].item == Item.spear, effect: t => { t[1].die(DeathCause.spearStab, t[0]); } },
        { pups: 1, text: "[0] accidentally sets off their own grenade while fiddling with it.", chance: 0.1, bias: t => t[0].bias(Stat.energy, 0.15), req: t => t[0].item == Item.grenade, effect: t => { t[0].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 2, text: "[0] flings their grenade in [1]'s vicinity, killing them in the explosion.", chance: 0.5, bias: t => t[0].attack(0.4, -0.15, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 3, text: "[0] catches [1] and [2] in a well-placed grenade explosion.", chance: 0.5, bias: t => t[0].attack(0.4, -0.15, t[1], t[2]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); t[2].die(DeathCause.grenadeExplosion, t[0]); } },
        // Failed Items
        { pups: 2, text: "[0] aims a spear at [1], but [1] dodges just in time.", chance: 0.25, bias: t => t[0].attack(0.2, 0.15, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 1, text: "[0] dramatically sticks their spear in the ground, permanently embedding it.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.2), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 2, text: "[0] flings their grenade at [1], but misses.", chance: 0.25, bias: t => t[0].attack(0.2, 0.1, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; } },
    ];
    static nextRound() {
        try {
            this.round++;
            getId("game").style.right = "100%";
            for (let i of this.pups) {
                i.hasInitiated = false;
                i.hasActed = false;
                i.selectAction();
            }
            let order = shuffle(this.pups);
            for (let i of order) {
                if (i.dead || !i.action.action || !i.action.pups)
                    continue;
                if (i.action.pups.filter(x => x.hasActed || x.dead).length)
                    continue;
                if (i.action.action.effect)
                    i.action.action.effect(i.action.pups);
                i.hasInitiated = true;
                for (let j of i.action.pups) {
                    j.hasActed = true;
                }
            }
            setTimeout(function () {
                try {
                    getId("gamepups").innerHTML = "";
                    getId("roundtitle").textContent = "Round " + Game.round;
                    for (let i of order) {
                        if (!i.hasInitiated)
                            continue;
                        let actionUI = document.createElement("div");
                        actionUI.classList.add("action");
                        for (let j of i.action.pups) {
                            let image = document.createElement("img");
                            image.src = j.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                            image.style.background = j.color;
                            image.classList.add("pupimg");
                            actionUI.appendChild(image);
                        }
                        let text = document.createElement("span");
                        let t = i.action.action.text;
                        for (let p = 0; p < i.action.pups.length; p++) {
                            t = t.replaceAll(`[${p}]`, i.action.pups[p].name);
                        }
                        text.textContent = t;
                        text.classList.add("actiontext");
                        actionUI.appendChild(text);
                        getId("gamepups").appendChild(actionUI);
                    }
                    let scoreUI = document.createElement("div");
                    scoreUI.id = "scoreui";
                    for (let i of Game.pups) {
                        let image = document.createElement("img");
                        image.src = i.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                        image.style.background = i.color;
                        image.classList.add("pupimg", "small");
                        scoreUI.appendChild(image);
                        let text = document.createElement("span");
                        if (i.dead)
                            text.style.color = "#bbb";
                        text.classList.add("scoretext");
                        text.textContent = i.name;
                        if (i.dead && !i.killedBy && !i.deathCause)
                            text.textContent += " - dead";
                        if (!i.dead)
                            text.textContent += " - alive" + (i.perks.length ? ", " : "") + i.perks.join(", ");
                        for (let j of Game.pups) {
                            if (i.relationWith(j).forth != RelationType.default)
                                text.innerHTML += `, ${j.dead ? "formerly " : ""}${i.relationWith(j).forth} with <img src="./assets/slugpup.png" class="pupimg tiny" style="background: ${j.color};"> ${j.name}${j.dead ? "†" : ""}`;
                        }
                        if (i.kills)
                            text.textContent += ", " + i.kills + " kill" + (i.kills == 1 ? "" : "s");
                        if (i.killedBy || i.deathCause)
                            text.textContent += " - killed";
                        if (i.killedBy)
                            text.textContent += " by " + i.killedBy.name;
                        if (i.deathCause)
                            text.textContent += " from " + i.deathCause;
                        scoreUI.appendChild(text);
                        scoreUI.appendChild(document.createElement("br"));
                    }
                    getId("game").appendChild(scoreUI);
                    getId("game").style.right = "0%";
                }
                catch (e) {
                    alert(e);
                }
            }, 700);
        }
        catch (e) {
            alert(e);
        }
    }
}
