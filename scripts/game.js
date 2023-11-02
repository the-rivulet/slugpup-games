import { Slugpup } from "./slugpup.js";
import { getId, Stat, Item, shuffle, DeathCause, RelationType, Perk, Creature, randomColor, choice } from "./globals.js";
export class Game {
    static round = 0;
    static pups = [];
    static relations = [];
    static actionPool = [
        // Idle
        { pups: 1, text: "[0] looks for some useful items.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1) },
        { pups: 1, text: "[0] takes a quick nap.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.3) },
        { pups: 1, text: "[0] looks for some easy kills.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1) },
        { pups: 2, text: "[0] sees [1] as an easy target and thinks about killing [1:them].", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1) },
        { pups: 1, text: "[0] explores on [0:their] own.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1) + t[0].bias(Stat.dominance, -0.1) },
        { pups: 1, text: "[0] feels confident [0:they] can win.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, -0.2) },
        { pups: 1, text: "[0] hides in a pipe to escape a vulture.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.2) },
        { pups: 1, text: "[0] finds some food on the ground, but realizes that a dropwig is probably using it as bait.", chance: 0.1, bias: t => t[0].dodge(0.1) },
        { pups: 1, text: "[0] tries to catch some batflies, but a squidcada beats [0:them] to it.", chance: 0.1 },
        { pups: 2, text: "[0] throws a vulture grub and runs off. Luckily, [1] manages to avoid it.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1) + t[0].bias(Stat.nervousness, -0.1) },
        // Item Idle
        { pups: 1, text: "[0] wishes [0:they] had something to defend [0:themselves] with.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1), req: t => t[0].item == Item.empty },
        // Relation Idle
        { pups: 2, text: "[0] and [1] explore the region together.", chance: 0.2, req: t => t[0].relationWith(t[1]).shared == RelationType.friends },
        { pups: 2, text: "[0] tends to [1]'s wounds.", chance: 0.2, req: t => t[0].relationWith(t[1]).shared == RelationType.friends },
        { pups: 2, text: "[0] curses [1] under [0:their] breath.", chance: 0.1, req: t => t[0].relationWith(t[1]).forth == RelationType.swornEnemies },
        // Perk Idle
        { pups: 1, text: "[0] zips about with enhanced speed.", chance: 0.2, req: t => t[0].perks.includes(Perk.hasty), bias: t => t[0].bias(Stat.energy, 0.4) },
        { pups: 1, text: "[0] feels like [0:they] can't possibly win.", chance: 0.2, req: t => t[0].perks.includes(Perk.suicidal) },
        // Death Idle
        { pups: 1, text: "[0] mourns the loss of [0:their] former friend [R].", chance: 0.3, req: t => Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.friends).length > 0, bias: t => t[0].friend(0.3), effect: t => choice(Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.friends)).name },
        { pups: 1, text: "[0] wishes [0:they] had been the one to kill [R].", chance: 0.3, req: t => Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.swornEnemies && x.killedBy != t[0]).length > 0, bias: t => t[0].friend(-0.3), effect: t => choice(Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.swornEnemies && x.killedBy != t[0])).name },
        // Food
        { pups: 1, text: "[0] finds a batfly hive and catches some batflies.", chance: 0.1, effect: t => { t[0].xp += Math.floor(Math.random() * 3) + 1; } },
        { pups: 1, text: "[0] pins a batfly to a wall with [0:their] spear and eats it.", chance: 0.1, req: t => t[0].item == Item.spear, effect: t => { t[0].item == Item.empty; t[0].xp++; } },
        { pups: 2, text: "[0] forms a temporary alliance with [1] to catch batflies.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(0.2), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 1; t[1].xp += Math.floor(Math.random() * 2) + 1; } },
        { pups: 2, text: "[0] and [1] work together to catch batflies and share their haul.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(0.2), req: t => t[0].relationWith(t[1]).shared == RelationType.friends, effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; t[1].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 1, text: "[0] comes across some blue fruit and eats it.", chance: 0.2, bias: t => t[0].bias(Stat.nervousness, 0.2) + t[0].bias(Stat.energy, -0.2), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 1, text: "[0] notices a patch of slime mold glowing in a shady corner.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 2, text: "[1] knocks down some blue fruit to trick [0] into thinking a dropwig is waiting above it.", chance: 0.1, bias: t => t[0].friend(-0.1), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 1; } },
        // Friendships
        { pups: 2, text: "[0] asks [1] if they can team up. [1] gratefully accepts.", chance: 0.4, bias: t => t[0].friend(0.4) + t[1].friend(0.4), req: t => !t[0].anyRelation(t[1], RelationType.friends, RelationType.swornEnemies), effect: t => { t[0].become(RelationType.friends, t[1], true); } },
        { pups: 2, text: "[0] shares some knowledge with [1].", chance: 0.3, bias: t => t[0].friend(0.3), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { if (Math.random() < 0.5 && !t[0].anyRelation(t[1], RelationType.friends))
                t[0].become(RelationType.friends, t[1], true); } },
        { pups: 3, text: "[0] and [1] invite [2] to their friend group. [2] agrees.", chance: 0.5, bias: t => t[0].friend(0.5) + t[1].friend(0.5) + t[2].friend(0.5), req: t => t[0].relationWith(t[1]).shared == RelationType.friends && !t[0].anyRelation(t[2], RelationType.friends, RelationType.swornEnemies) && !t[1].anyRelation(t[2], RelationType.friends, RelationType.swornEnemies),
            effect: t => { t[0].become(RelationType.friends, t[2], true); t[1].become(RelationType.friends, t[2], true); } },
        { pups: 2, text: "[0] apologizes to [1], who forgives [0:them].", chance: 0.8, bias: t => t[0].bias(Stat.sympathy, 0.5) + t[1].bias(Stat.sympathy, 0.5), req: t => { let x = t[0].relationWith(t[1]); return x.forth == RelationType.friends && x.back != RelationType.friends; }, effect: t => { t[1].become(RelationType.friends, t[0]); } },
        { pups: 2, text: "[0] wants to be friends with [1], but [1] politely declines.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(-0.2) + t[1].bias(Stat.nervousness, 0.2), req: t => !t[0].anyRelation(t[1], RelationType.friends, RelationType.swornEnemies) },
        { pups: 2, text: "[0] accidentally says something bad about [0:their] friend [1].", chance: 0.1, bias: t => t[0].bias(Stat.energy, 0.1) + t[0].attack(-0.1), req: t => t[1].anyRelation(t[0], RelationType.friends), effect: t => { t[1].become(RelationType.default, t[0]); } },
        { pups: 2, text: "[0] decides it's everyone for themselves here. [1] sadly parts ways with [0].", chance: 0.3, bias: t => t[0].friend(-0.3), req: t => t[0].relationWith(t[1]).forth == RelationType.friends, effect: t => { t[0].become(RelationType.default, t[1], true); } },
        // Enemyships?
        { pups: 2, text: "[0] throws rubbish at [1], annoying [1:them].", chance: 0.4, bias: t => t[0].friend(-0.4), req: t => t[1].relationWith(t[0]).forth == RelationType.default, effect: t => { t[1].become(RelationType.swornEnemies, t[0]); } },
        { pups: 2, text: "[0] decides [1] can't stay alive and swears to kill [1:them].", chance: 0.4, bias: t => t[0].friend(-0.4), req: t => t[0].relationWith(t[1]).forth != RelationType.friends && t[0].relationWith(t[1]).forth != RelationType.swornEnemies, effect: t => { t[0].become(RelationType.swornEnemies, t[1]); } },
        // Perks
        { pups: 1, text: "[0] finds a mushroom and eats it, feeling [0:their] senses heighten.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.08), req: t => !t[0].perks.includes(Perk.hasty), effect: t => { t[0].perks.push(Perk.hasty); } },
        { pups: 1, text: "[0] starts to question [0:their] own sanity.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1), req: t => !t[0].perks.includes(Perk.suicidal), effect: t => { if (Math.random() < 0.5)
                t[0].perks.push(Perk.suicidal); } },
        { pups: 1, text: "[0] feeds some scraps to a green lizard and wins its loyalty.", chance: 0.2, bias: t => t[0].bias(Stat.sympathy, 0.4), req: t => !t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.push(Perk.tamedLizard); } },
        { pups: 1, text: "[0] finds another lizard and convinces it to join [0:their] army.", chance: 0.6, bias: t => t[0].bias(Stat.sympathy, 1.2), req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.push(Perk.tamedLizard); } },
        // Unperks
        { pups: 1, text: "[0] feels the mushroom's effects fading.", chance: 0.7, req: t => t[0].perks.includes(Perk.hasty), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.hasty), 1); } },
        { pups: 1, text: "[0] isn't giving up just yet.", chance: 0.4, req: t => t[0].perks.includes(Perk.suicidal), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.suicidal), 1); } },
        { pups: 1, text: "[0]'s tamed lizard walks off a cliff by mistake.", chance: 0.4, req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.tamedLizard), 1); } },
        // Pickups
        { pups: 1, text: "[0] picks up a [R].", chance: 0.9, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = choice([Item.spear, Item.spear, Item.spear, Item.flashbang, Item.flashbang, Item.grenade, Item.pearl]); return t[0].item; } },
        { pups: 1, text: "[0] comes across a scavenger merchant and barters for a spear with some nearby rubbish.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 2, text: "[0] discovers a [R] that [1] left behind in [1:their] shelter.", chance: 0.4, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.aggression, 0.3), req: t => t[0].item == Item.empty,
            effect: t => { let x = choice([Item.spear, Item.spear, Item.grenade, Item.grenade, Item.flashbang]); t[0].item = x; return x; } },
        { pups: 2, text: "[0] notices a spear that [1] mistook for a piece of rubbish.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 2, text: "[0] takes a spear from [1] while [1:they] [1:are] looking the other way.", chance: 0.3, bias: t => t[0].bias(Stat.energy, -0.2) + t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.bravery, 0.2), req: t => t[0].item == Item.empty && t[1].item == Item.spear, effect: t => { t[1].item = Item.empty; t[0].item = Item.spear; } },
        { pups: 2, text: "[0] finds a couple of spears and hands one to [1].", chance: 0.4, bias: t => t[0].bias(Stat.sympathy, 0.3) + t[0].bias(Stat.dominance, 0.2), req: t => t[0].item == Item.empty && t[1].item == Item.empty && t[0].relationWith(t[1]).forth == RelationType.friends, effect: t => { t[0].item = Item.spear; t[1].item = Item.spear; } },
        { pups: 1, text: "[0] takes a pearl from an unguarded scavenger treasury.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.energy, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.pearl; } },
        { pups: 2, text: "[0] puts [0:their] [R] down for a moment, letting [1] sneak up and take it.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.2) + t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.bravery, 0.2), req: t => t[0].item == Item.empty && t[1].item != Item.empty, effect: t => { let x = t[1].item; t[1].item = Item.empty; t[0].item = x; return x; } },
        // Scavs
        { pups: 1, text: "[0] trades [0:their] pearl for a scavenger's grenade.", chance: 0.6, bias: t => t[0].perks.includes(Perk.highRep) ? 0.9 : 0, req: t => t[0].item == Item.pearl && !t[0].perks.includes(Perk.lowRep), effect: t => { t[0].item == Item.grenade; if (Math.random() < 0.5 && !t[0].perks.includes(Perk.highRep))
                t[0].perks.push(Perk.highRep); } },
        { pups: 2, text: "[0] purchases [R]s for [0:themselves] and [0:their] friend [1] with a pearl.", chance: 0.8, bias: t => t[0].perks.includes(Perk.highRep) ? 1.2 : 0, req: t => t[0].item == Item.pearl && t[0].relationWith(t[1]).forth == RelationType.friends && !t[0].perks.includes(Perk.lowRep) && !t[1].perks.includes(Perk.lowRep),
            effect: t => { let x = choice([Item.spear, Item.spear, Item.grenade, Item.grenade, Item.flashbang]); t[0].item = x; t[1].item = x; if (Math.random() < 0.5 && !t[0].perks.includes(Perk.highRep))
                t[0].perks.push(Perk.highRep); if (Math.random() < 0.3 && !t[1].perks.includes(Perk.highRep))
                t[1].perks.push(Perk.highRep); return x; } },
        { pups: 1, text: "[0] throws a spear into a scavenger toll in an act of defiance.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => t[0].item == Item.spear && !t[0].perks.includes(Perk.highRep), effect: t => { t[0].item = Item.empty; t[0].xp += 6; if (!t[0].perks.includes(Perk.lowRep))
                t[0].perks.push(Perk.lowRep); } },
        { pups: 1, text: "[0] spears a scavenger to death so [0:they] can pass the toll without paying.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => t[0].item == Item.spear && !t[0].perks.includes(Perk.highRep), effect: t => { t[0].item = Item.empty; t[0].xp += 6; if (!t[0].perks.includes(Perk.lowRep))
                t[0].perks.push(Perk.lowRep); } },
        { pups: 2, text: "[0] and [1] don't want to pay, so they run past opposite sides of a scavenger toll and barely escape.", chance: 0.3, bias: t => t[0].attack(0.3) + t[1].attack(0.3), req: t => !t[0].perks.includes(Perk.highRep) && !t[1].perks.includes(Perk.highRep), effect: t => { for (let i of t) {
                if (!i.perks.includes(Perk.lowRep))
                    i.perks.push(Perk.lowRep);
            } } },
        { pups: 2, text: "[0] and [1] try to pass a scavenger toll without paying. Unforunately, [1] doesn't make it.", chance: 0.3, bias: t => t[0].attack(0.3) + t[1].attack(0.3) + t[1].dodge(-0.3), req: t => !t[0].perks.includes(Perk.highRep) && !t[1].perks.includes(Perk.highRep), effect: t => { if (!t[0].perks.includes(Perk.lowRep))
                t[0].perks.push(Perk.lowRep); t[1].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        { pups: 1, text: "[0] runs past a scavenger toll without paying and barely escapes with [0:their] life.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => !t[0].perks.includes(Perk.highRep), effect: t => { if (!t[0].perks.includes(Perk.lowRep))
                t[0].perks.push(Perk.lowRep); } },
        { pups: 1, text: "[0] is hunted down and killed by a patrol of scavengers.", chance: 0.8, bias: t => t[0].dodge(-0.4), req: t => t[0].perks.includes(Perk.lowRep), effect: t => { t[0].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        { pups: 1, text: "[0] thought the scavengers had forgotton [0:their] transgressions, but [0:they] [0:are] killed on sight.", chance: 0.8, bias: t => t[0].dodge(-0.8), req: t => t[0].perks.includes(Perk.lowRep), effect: t => { t[0].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        { pups: 2, text: "[0] is mistaken for an accomplice of [1] and is murdered for [1]'s crimes.", chance: 0.4, bias: t => t[0].dodge(-0.4), req: t => t[1].perks.includes(Perk.lowRep), effect: t => { t[0].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); t[1].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        { pups: 1, text: "[0] fails to notice the toll markings and is subsequently killed by a well-intentioned scavenger.", chance: 0.1, bias: t => t[0].dodge(-0.1), req: t => !t[0].perks.includes(Perk.highRep) && !t[0].perks.includes(Perk.lowRep), effect: t => { t[0].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        // Self Kills
        { pups: 2, text: "[0] tries to throw a grenade at [1], but misfires and kills [0:themselves] instead.", chance: 0.2, bias: t => t[0].attack(0.2, 0, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 1, text: "[0] accidentally sets off [0:their] own grenade while fiddling with it.", chance: 0.2, bias: t => t[0].bias(Stat.energy, 0.3), req: t => t[0].item == Item.grenade, effect: t => { t[0].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 1, text: "[0] can't handle this anymore and takes [0:their] own life.", chance: 0.2, req: t => t[0].perks.includes(Perk.suicidal), effect: t => { t[0].die(DeathCause.suicide, t[0]); } },
        { pups: 1, text: "[0] doesn't know what a vulture grub does and finds out too late.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].dodge(-0.2), effect: t => { t[0].die(DeathCause.vulture, t[0]); } },
        { pups: 2, text: "[0] tries to kill [1] using a vulture grub, but dies while [1] hides in a pipe.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].attack(0.2, 0, t[1]), effect: t => { t[0].die(DeathCause.vulture, t[0]); } },
        // Creature Deaths
        { pups: 1, text: "[0] meets [0:their] end in the jaws of a red lizard.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.lizard, new Creature("Red Lizard", "#f00")); } },
        { pups: 1, text: "[0] can't escape a centipede and gets shocked.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.shock, new Creature("Centipede", "#f70")); } },
        { pups: 1, text: "[0] can't hide in time and gets carried off by a vulture.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.vulture, new Creature("Vulture", "#aa0")); } },
        { pups: 1, text: "[0] doesn't look carefully enough before walking under a dropwig and is slashed open.", chance: 0.1, bias: t => t[0].dodge(-0.1) + t[0].bias(Stat.energy, 0.2), effect: t => { t[0].die(DeathCause.dropwig, new Creature("Dropwig", "#ccc")); } },
        { pups: 1, text: "[0] walks too close to a suspiciously placed grenade and is sliced to pieces by a dropwig.", chance: 0.1, bias: t => t[0].dodge(-0.1) + t[0].bias(Stat.dominance, 0.2), effect: t => { t[0].die(DeathCause.dropwig, new Creature("Dropwig", "#ccc")); } },
        { pups: 1, text: "[0] tries to climb a pole plant and realizes [0:their] mistake too late.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.polePlant, new Creature("Pole Plant", "#b99")); } },
        { pups: 1, text: "[0] attempts to sneak past a monster kelp, but [0:they] trip and get snatched.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.polePlant, new Creature("Monster Kelp", "#b99")); } },
        { pups: 2, text: "[1] dares [0] to grab a baby noodlefly and laughs as [0:they] get harpooned.", chance: 0.1, bias: t => t[0].dodge(-0.1), req: t => t[1].relationWith(t[0]).forth != RelationType.friends, effect: t => { t[0].die(DeathCause.backstab, new Creature("Noodlefly", "#faa")); } },
        { pups: 2, text: "[1] shoves [0] into a leech-infested pool.", chance: 0.1, bias: t => t[0].dodge(-0.1), req: t => t[1].relationWith(t[0]).forth != RelationType.friends, effect: t => { t[0].die(DeathCause.drowning, t[1]); } },
        { pups: 2, text: "[0] tries to shove [1] into a pit of leeches, but [1] dodges [0:them] and pushes [0:them] in instead.", chance: 0.1, bias: t => t[0].dodge(-0.1) + t[1].dodge(0.1), req: t => t[1].relationWith(t[0]).forth != RelationType.friends, effect: t => { t[0].die(DeathCause.backstab, t[1]); } },
        // Unarmed Kills
        { pups: 2, text: "[0] and [1] get into a feud about food, resulting in [0] angrily killing [1].", chance: 0.3, bias: t => t[0].bias(Stat.aggression, 0.4) + t[0].attack(0.3, -0.3, t[1]), req: t => t[0].item == Item.empty && t[1].item == Item.empty, effect: t => { t[1].die(DeathCause.brawl, t[0]); } },
        { pups: 2, text: "[1] starts arguing with [0] about shelters, causing [0] to kill [1] in a fit of rage.", chance: 0.3, bias: t => t[0].bias(Stat.aggression, 0.4) + t[1].bias(Stat.aggression, 0.4) + t[0].attack(0.3, -0.3, t[1]), req: t => t[0].item == Item.empty && t[1].item == Item.empty, effect: t => { t[1].die(DeathCause.brawl, t[0]); } },
        { pups: 3, text: "[0] and [1] get into a brawl. [0] wins thanks to some help from [0:their] friend [2].", chance: 0.3, bias: t => t[0].bias(Stat.bravery, 0.4) + t[0].attack(0.3, -0.3, t[1]) + t[1].bias(Stat.bravery, 0.4), req: t => t[0].item == Item.empty && t[1].item == Item.empty && t[2].relationWith(t[0]).forth == RelationType.friends, effect: t => { t[1].die(DeathCause.brawl, t[0]); } },
        { pups: 2, text: "[0] and [1] start a fistfight and bleed out in the aftermath.", chance: 0.3, bias: t => t[0].bias(Stat.bravery, 0.4) + t[0].attack(0.3, -0.3, t[1]) + t[1].attack(0.3, -0.3, t[0]) + t[1].bias(Stat.bravery, 0.4), req: t => t[0].item == Item.empty && t[1].item == Item.empty,
            effect: t => { t[1].die(DeathCause.brawl, t[0]); t[0].die(DeathCause.brawl, t[1]); } },
        { pups: 2, text: "[1] tries to defend [1:themselves] with [1:their] [R], but [0] kills [1:them] and takes it.", chance: 0.3, bias: t => t[0].attack(0.3, -0.3, t[1]), req: t => t[0].item == Item.empty && t[1].item != Item.empty, effect: t => { t[1].die(DeathCause.brawl, t[0]); t[0].item = t[1].item; return t[0].item; } },
        { pups: 3, text: "[0] and [1] agree that [2] needs to die. [2] is outnumbered and finished off by [0].", chance: 0.3, bias: t => (t[0].anyRelation(t[1], RelationType.friends) ? 1 : 0) + t[0].attack(0.3, -0.3, t[2]) + t[1].attack(0.3, -0.3, t[2]), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { t[2].die(DeathCause.brawl, t[0]); } },
        { pups: 3, text: "[0] teams up with [1] to attack [2]. [2] tries to run away, but is ultimately killed by [1].", chance: 0.3, bias: t => (t[0].anyRelation(t[1], RelationType.friends) ? 1 : 0) + t[0].attack(0.3, -0.3, t[2]) + t[1].attack(0.3, -0.3, t[2]), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { t[2].die(DeathCause.brawl, t[1]); } },
        { pups: 3, text: "[0] teams up with [1] to attack [2]. Only [1] manages to survive.", chance: 0.3, bias: t => (t[0].anyRelation(t[1], RelationType.friends) ? 1 : 0) + t[0].attack(0.3, -0.3, t[2]) + t[2].attack(0.3, -0.3, t[0]), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { t[2].die(DeathCause.brawl, t[0]); t[0].die(DeathCause.brawl, t[2]); } },
        { pups: 2, text: "[0] challenges [1] to a brawl, but regrets it as [1] wipes the floor with [0:them].", chance: 0.3, bias: t => t[0].bias(Stat.bravery, 0.4) + t[0].attack(0.2) + t[1].attack(0.2, 0.2, t[0]), req: t => t[0].item == Item.empty && t[1].item == Item.empty, effect: t => { t[0].die(DeathCause.brawl, t[1]); } },
        { pups: 2, text: "[0] uses a vulture grub to summon a vulture to kill [1].", chance: 0.3, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].attack(0.3, -0.3, t[1]), effect: t => { t[1].die(DeathCause.vulture, t[0]); } },
        // Item Kills
        { pups: 2, text: "[0] fires a spear straight through [1]'s head.", chance: 0.5, bias: t => t[0].attack(0.5, -0.5, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.spearThrow, t[0]); } },
        { pups: 2, text: "[0] throws a spear at [1], but [1:they] catch it and throws it back at [0].", chance: 0.5, bias: t => t[0].attack(0.5, 0.5, t[1]) + t[1].attack(0.5, -0.5, t[0]), req: t => t[0].item == Item.spear, effect: t => { t[0].die(DeathCause.spearThrow, t[1]); } },
        { pups: 2, text: "[0] discovers [1] trying to catch batflies and spears [1:them] while [1:their] back is turned.", chance: 0.5, bias: t => t[0].attack(0.5, -0.3, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.backstab, t[0]); } },
        { pups: 3, text: "[0] distracts [1] while [0:their] friend [2] comes up from behind and stabs [1:them].", chance: 0.8, bias: t => t[2].attack(0.6, -0.2, t[1]) + t[0].friend(0.4) + t[2].friend(0.4), req: t => t[2].item == Item.spear && t[2].relationWith(t[0]).forth == RelationType.friends,
            effect: t => { t[2].item = Item.empty; t[1].die(DeathCause.backstab, t[2]); } },
        { pups: 2, text: "[0] sneaks up behind [1] and stabs [1:them].", chance: 0.3, bias: t => t[0].attack(0.3, -0.1, t[1]) + t[0].bias(Stat.energy, -0.2), req: t => t[0].item == Item.spear, effect: t => { t[1].die(DeathCause.backstab, t[0]); } },
        { pups: 3, text: "[0] and [1] are too caught up in their conversation to notice [2] sneaking up.", chance: 0.5, bias: t => t[2].attack(0.5, -0.3, t[0]) + t[2].attack(0.5, -0.3, t[1]) + t[0].bias(Stat.energy, -0.3), req: t => t[0].relationWith(t[1]).shared == RelationType.friends && t[2].item == Item.spear, effect: t => { t[1].die(DeathCause.backstab, t[2]); t[0].die(DeathCause.backstab, t[2]); } },
        { pups: 2, text: "[0] throws a grenade at [1], killing [1:them] in the explosion.", chance: 0.5, bias: t => t[0].attack(0.5, -0.3, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 2, text: "[0] hits [1] with a grenade, blowing [1:them] to smithereens.", chance: 0.5, bias: t => t[0].attack(0.5, -0.3, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 3, text: "[0] catches [1] and [2] with a well-placed grenade explosion.", chance: 0.4, bias: t => t[0].attack(0.4, -0.2, t[1], t[2]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); t[2].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 2, text: "[0] hits [1] with a flashbang and mauls [1:them] to death while [1:they] [1:are] helpless.", chance: 0.5, bias: t => t[0].attack(0.5, -0.4, t[1]), req: t => t[0].item == Item.flashbang, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.brawl, t[0]); } },
        { pups: 3, text: "[0] and [1] work together to kill [2] after blinding [2:them] with a flashbang.", chance: 0.5, bias: t => t[1].friend(0.5) + t[0].friend(0.5) + t[0].attack(0.4, -0.4, t[2]), req: t => t[0].item == Item.flashbang && t[0].relationWith(t[1]).shared == RelationType.friends, effect: t => { t[0].item = Item.empty; t[2].die(DeathCause.brawl, t[0]); } },
        { pups: 2, text: "[0] throws a flashbang at [1] and [2] before finishing them off.", chance: 0.5, bias: t => t[0].attack(0.5, -0.4, t[1], t[2]), req: t => t[0].item == Item.flashbang, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.brawl, t[0]); t[2].die(DeathCause.brawl, t[0]); } },
        { pups: 2, text: "[0] tries to blind [1] with a flashbang, but [1] closes [1:their] eyes to avoid it and kills [0] instead.", chance: 0.4, bias: t => t[1].attack(0.4, -0.4, t[0]), req: t => t[0].item == Item.flashbang, effect: t => { t[0].die(DeathCause.brawl, t[1]); } },
        { pups: 2, text: "[0] accidentally blinds [0:themselves] by dropping a flashbang, giving [1] the opportunity to kill [0:them].", chance: 0.4, bias: t => t[1].attack(0.4, -0.4, t[0]), req: t => t[0].item == Item.flashbang, effect: t => { t[0].die(DeathCause.brawl, t[1]); } },
        { pups: 2, text: "[0] snipes an eggbug, but [1] runs off with most of the eggs before [0] arrives.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[0].xp += 3; t[1].xp += 5; } },
        { pups: 2, text: "[0] is almost killed by a lizard, but [1] rescues [0:them] with a spear.", chance: 0.5, bias: t => t[1].bias(Stat.bravery, -0.5), req: t => t[0].relationWith(t[1]).shared == RelationType.friends && t[1].item == Item.spear, effect: t => { t[1].xp += Math.floor(Math.random() * 6) + 5; t[1].item = Item.empty; } },
        { pups: 2, text: "[0] is bitten by a lizard, leaving [1] to watch helplessly as [0:they] [1:are] dragged into its den and eaten.", chance: 0.5, bias: t => t[1].bias(Stat.bravery, 0.5), req: t => t[0].relationWith(t[1]).shared == RelationType.friends, effect: t => { t[1].xp += Math.floor(Math.random() * 6) + 5; t[1].item = Item.empty; } },
        { pups: 3, text: "[0] kills [1] with a spear, but [2] retaliates and kills [0] in revenge.", chance: 0.6, bias: t => t[2].friend(0.6) + t[0].attack(0.6, -0.6, t[1]), req: t => t[0].item == Item.spear && t[2].relationWith(t[1]).forth == RelationType.friends, effect: t => { t[1].die(DeathCause.spearThrow, t[0]); t[0].die(DeathCause.brawl, t[2]); } },
        // Failed Items
        { pups: 2, text: "[0] aims a spear at [1], but [1] dodges just in time.", chance: 0.3, bias: t => t[0].attack(0.3, 0.3, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 1, text: "[0] has a spear taken off [0:their] back by a garbage worm.", chance: 0.2, bias: t => t[0].dodge(-0.2), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 2, text: "[0] was about to spear [1], but runs away after an overseer points [0:them] out to [1].", chance: 0.3, bias: t => t[0].attack(0.3, 0, t[1]), req: t => t[0].item == Item.spear },
        { pups: 2, text: "[0] flings [0:their] grenade at [1], but misses.", chance: 0.2, bias: t => t[0].attack(0.2, 0.1, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; } },
        // Perk Kills
        { pups: 2, text: "[0] sics [0:their] pet lizard on [1]. [1] can't escape and dies to its bite.", chance: 0.5, bias: t => t[0].attack(0.5, -0.5, t[1]), req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizard", randomColor())); } },
        { pups: 2, text: "[0] can't keep [0:their] lizard under control, resulting in [1] being bitten and killed.", chance: 0.3, req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizard", randomColor())); } },
        { pups: 2, text: "[0] sends [0:their] lizard followers to attack [1]. [1] is surrounded and killed.", chance: 0.8, bias: t => t[0].attack(0.8, -0.2, t[1]), req: t => t[0].perks.filter(x => x == Perk.tamedLizard).length >= 2, effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizards", randomColor())); } },
        { pups: 3, text: "[1] and [2] are ruthlessly ripped to shreds by [0]'s army of tamed lizards.", chance: 0.8, bias: t => t[0].attack(0.6, -0.2, t[1]) + t[0].attack(0.6, -0.2, t[2]), req: t => t[0].perks.filter(x => x == Perk.tamedLizard).length >= 2,
            effect: t => { let x = randomColor(); t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizards", x)); t[2].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizards", x)); } },
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
                let output;
                if (i.action.action.effect)
                    output = i.action.action.effect(i.action.pups);
                i.output = output || "";
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
                            let txt = document.createElement("span");
                            txt.classList.add("txt");
                            txt.innerHTML = j.name + "<br/>" + Object.keys(j.stats).map(x => x + " - " + j.stats[x]).join("<br/>");
                            let dummy = document.createElement("span");
                            dummy.classList.add("dummy");
                            dummy.appendChild(image);
                            dummy.appendChild(txt);
                            actionUI.appendChild(dummy);
                        }
                        let text = document.createElement("span");
                        let t = i.action.action.text;
                        for (let p = 0; p < i.action.pups.length; p++) {
                            let pup = i.action.pups[p];
                            t = t.replaceAll(`[${p}]`, pup.name);
                            t = t.replaceAll(`[${p}:they]`, pup.pronouns.they);
                            t = t.replaceAll(`[${p}:them]`, pup.pronouns.them);
                            t = t.replaceAll(`[${p}:their]`, pup.pronouns.their);
                            t = t.replaceAll(`[${p}:theirs]`, pup.pronouns.their + pup.pronouns.their.slice(-1) == "s" ? "" : "s");
                            t = t.replaceAll(`[${p}:themselves]`, pup.pronouns.them == "them" ? "themselves" : pup.pronouns.them + "self");
                            t = t.replaceAll(`[${p}:are]`, pup.pronouns.they == "they" ? "are" : "is");
                        }
                        t = t.replaceAll("[R]", i.output);
                        text.textContent = t;
                        text.classList.add("actiontext");
                        actionUI.appendChild(text);
                        getId("gamepups").appendChild(actionUI);
                    }
                    let scoreUI = document.createElement("div");
                    scoreUI.id = "scoreui";
                    for (let i of Game.pups.sort((a, b) => a.realKills == b.realKills ? b.xp - a.xp : b.realKills - a.realKills)) {
                        let image = document.createElement("img");
                        image.src = i.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                        image.style.background = i.color;
                        image.classList.add("pupimg", "small");
                        scoreUI.appendChild(image);
                        let text = document.createElement("span");
                        if (i.dead)
                            text.style.color = "#999";
                        text.classList.add("scoretext");
                        let nameText = document.createElement("b");
                        nameText.textContent = i.name;
                        text.appendChild(nameText);
                        if (i.dead && !i.killedBy && !i.deathCause)
                            text.insertAdjacentText("beforeend", " - dead");
                        if (!i.dead)
                            text.insertAdjacentText("beforeend", " - alive" + (i.item == Item.empty ? "" : " - holding " + i.item));
                        text.insertAdjacentText("beforeend", (i.perks.length ? " - " : "") + i.perks.join(", "));
                        let hasInserted = !i.dead;
                        for (let j of Game.pups) {
                            if (i.relationWith(j).forth != RelationType.default) {
                                text.insertAdjacentText("beforeend", (hasInserted ? ", " : " - ") + i.relationWith(j).forth + " with ");
                                let coloredText = document.createElement("b");
                                coloredText.style.color = j.color;
                                coloredText.textContent = j.name;
                                text.appendChild(coloredText);
                                if (j.dead)
                                    text.insertAdjacentText("beforeend", "†");
                            }
                        }
                        if (i.kills)
                            text.insertAdjacentText("beforeend", " - " + i.kills + " kill" + (i.kills == 1 ? "" : "s"));
                        if (i.killedBy || i.deathCause)
                            text.insertAdjacentText("beforeend", " - killed");
                        if (i.killedBy) {
                            text.insertAdjacentText("beforeend", " by ");
                            let coloredText = document.createElement("b");
                            coloredText.style.color = i.killedBy.color;
                            coloredText.textContent = i.killedBy.name;
                            text.appendChild(coloredText);
                            if (i.killedBy instanceof Slugpup && i.killedBy.dead)
                                text.insertAdjacentText("beforeend", "†");
                        }
                        if (i.deathCause)
                            text.insertAdjacentText("beforeend", " (" + i.deathCause + ")");
                        scoreUI.appendChild(text);
                        scoreUI.appendChild(document.createElement("br"));
                    }
                    getId("gamepups").appendChild(scoreUI);
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
