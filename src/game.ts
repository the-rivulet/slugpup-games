import type { Slugpup } from "./slugpup.js";
import { getId, Stat, Action, Item, shuffle, Relationship } from "./globals.js";

export class Game {
    static round = 0;
    static pups: Slugpup[] = [];
    static relationships: Relationship[] = [];
    static actionPool: Action[] = [
        // Idle
        {pups: 1, text: "[0] looks for more items.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1)},
        {pups: 1, text: "[0] is taking a nap.", chance: 0.1, bias: t => t[0].bias(Stat.energy, -0.1)},
        {pups: 1, text: "[0] sees some weapons on the ground but ignores them.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, -0.1) + t[0].bias(Stat.sympathy, 0.1) + t[0].bias(Stat.dominance, -0.05)},
        {pups: 2, text: "[0] thinks about killing [1].", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1)},
        {pups: 1, text: "[0] looks for another slugpup to follow.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, -0.1)},
        {pups: 1, text: "[0] paces the arena nervously.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1)},
        {pups: 1, text: "[0] is confident they can win.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, -0.1)},
        {pups: 2, text: "[0] isn't afraid of [1].", chance: 0.1, bias: t => t[0].bias(Stat.bravery, 0.1) + t[0].bias(Stat.sympathy, 0.1)},
        {pups: 2, text: "[0] looks at [1]'s weaponry with concern.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1), req: t => t[1].item == Item.spear || t[1].item == Item.grenade},
        // Item Idle
        {pups: 1, text: "[0] wishes they had something to defend themselves with.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.05), req: t => t[0].item == Item.empty},
        // -- Current sum of idles: dominance 0, energy -0.1, sympathy 0.1, aggression 0, nervousness 0.1, bravery 0.1
        // Pickups
        {pups: 1, text: "[0] picks up a spear.", chance: 1.0, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.aggression, 0.5), req: t => t[0].item == Item.empty, effect: t => {t[0].item = Item.spear;}},
        {pups: 1, text: "[0] picks up a grenade.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.04) + t[0].bias(Stat.aggression, 0.1), req: t => t[0].item == Item.empty, effect: t => {t[0].item = Item.grenade;}},
        // Using Items
        {pups: 2, text: "[0] impales [1] with a spear, killing them.", chance: 0.5, bias: t => t[0].bias(Stat.sympathy, -0.3) + t[0].bias(Stat.aggression, 0.3) + t[1].bias(Stat.nervousness, -0.15) + t[1].bias(Stat.aggression, -0.15), req: t => t[0].item == Item.spear, effect: t => {t[0].item = Item.empty; t[1].dead = true;}},
        // Failed Items
        {pups: 2, text: "[0] tries to spear [1], but [1] dodges just in time.", chance: 0.5, bias: t => t[0].bias(Stat.sympathy, -0.3) + t[0].bias(Stat.aggression, 0.3) + t[1].bias(Stat.nervousness, 0.15) + t[1].bias(Stat.aggression, 0.15), req: t => t[0].item == Item.spear, effect: t => {t[0].item = Item.empty;}},
    ];
    static nextRound() { try {
        this.round++;
        getId("game").style.right = "100%";
        for(let i of this.pups) {
            i.hasInitiated = false;
            i.hasActed = false;
            i.selectAction();
        }
        let order = shuffle(this.pups);
        for(let i of order) {
            if(i.dead || !i.action.action || !i.action.pups) continue;
            if(i.action.pups.filter(x => x.hasActed || x.dead).length) continue;
            if(i.action.action.effect) i.action.action.effect(i.action.pups);
            i.hasInitiated = true;
            for(let j of i.action.pups) {
                j.hasActed = true;
            }
        }
        setTimeout(function() { try {
            getId("gamepups").innerHTML = "";
            getId("roundtitle").textContent = "Round " + Game.round;
            for(let i of order) {
                if(!i.hasInitiated) continue;
                let actionUI = document.createElement("div");
                actionUI.classList.add("action");
                for(let j of i.action.pups) {
                    let image = document.createElement("img");
                    image.src = j.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                    image.style.background = j.color;
                    image.classList.add("pupimg");
                    actionUI.appendChild(image);
                }
                let text = document.createElement("span");
                let t = i.action.action.text;
                for(let p = 0; p < i.action.pups.length; p++) {
                    t = t.replaceAll(`[${p}]`, i.action.pups[p].name);
                }
                t = t[0].toUpperCase() + t.slice(1);
                text.textContent = t;
                text.classList.add("actiontext");
                actionUI.appendChild(text);
                getId("gamepups").appendChild(actionUI);
            }
            let scoreUI = document.createElement("div");
            scoreUI.id = "scoreui";
            for(let i of Game.pups) {
                let image = document.createElement("img");
                image.src = i.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                image.style.background = i.color;
                image.classList.add("pupimg", "small");
                scoreUI.appendChild(image);
                let text = document.createElement("span");
                text.classList.add("scoretext");
                text.textContent = i.name;
                if(i.dead) text.textContent += " - dead"; else text.textContent += " - alive";
                if(i.kills) text.textContent += " - " + i.kills + " kills";
                if(i.killedBy) text.textContent += " - killed by " + i.killedBy.name;
                scoreUI.appendChild(text);
                scoreUI.appendChild(document.createElement("br"));
            }
            getId("game").appendChild(scoreUI);
            getId("game").style.right = "0%";
        } catch(e) { alert(e) } }, 700);
    } catch(e) { alert(e) } }
}