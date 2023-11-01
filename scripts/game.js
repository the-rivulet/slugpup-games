import { getId, Stat, Item, shuffle, DeathCause, RelationType, Perk, Creature, randomColor, choice } from "./globals.js";
export class Game {
    static round = 0;
    static pups = [];
    static relations = [];
    static actionPool = [
        // Idle
        { pups: 1, text: "[0] looks for some useful items.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1) },
        { pups: 1, text: "[0] takes a quick nap.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.3) },
        { pups: 1, text: "[0] sees a spear on the ground but ignores it.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, -0.1) + t[0].bias(Stat.dominance, -0.1) },
        { pups: 1, text: "[0] looks for some easy kills.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1) },
        { pups: 2, text: "[0] sees [1] as an easy target and thinks about killing them.", chance: 0.1, bias: t => t[0].bias(Stat.aggression, 0.2) + t[0].bias(Stat.sympathy, -0.1) },
        { pups: 1, text: "[0] explores on their own.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1) + t[0].bias(Stat.dominance, -0.1) },
        { pups: 1, text: "[0] feels confident they can win.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, -0.2) },
        { pups: 2, text: "[0] wants to talk to [1], but can't work up the courage.", chance: 0.1, bias: t => t[0].bias(Stat.sympathy, 0.1) + t[0].bias(Stat.bravery, -0.1) },
        { pups: 1, text: "[0] hides in a pipe to escape a vulture.", chance: 0.2, bias: t => t[0].bias(Stat.energy, -0.2) },
        { pups: 1, text: "[0] finds some food on the ground, but realizes that a dropwig is probably using it as bait.", chance: 0.1, bias: t => t[0].dodge(0.1) },
        // Item Idle
        { pups: 1, text: "[0] wishes they had something to defend themselves with.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1), req: t => t[0].item == Item.empty },
        // Relation Idle
        { pups: 2, text: "[0] and [1] explore the region together.", chance: 0.2, req: t => t[0].relationWith(t[1]).shared == RelationType.friends },
        { pups: 2, text: "[0] tends to [1]'s wounds.", chance: 0.2, req: t => t[0].relationWith(t[1]).shared == RelationType.friends },
        { pups: 2, text: "[0] curses [1] under their breath.", chance: 0.1, req: t => t[0].relationWith(t[1]).forth == RelationType.swornEnemies },
        // Perk Idle
        { pups: 1, text: "[0] zips about with enhanced speed.", chance: 0.2, req: t => t[0].perks.includes(Perk.hasty), bias: t => t[0].bias(Stat.energy, 0.4) },
        { pups: 1, text: "[0] feels like they can't possibly win.", chance: 0.2, req: t => t[0].perks.includes(Perk.suicidal) },
        // Death Idle
        { pups: 1, text: "[0] mourns the loss of their former friend [R].", chance: 0.3, req: t => Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.friends).length > 0, bias: t => t[0].friend(0.3), effect: t => choice(Game.pups.filter(x => x.dead && t[0].relationWith(x).forth == RelationType.friends)).name },
        // Food
        { pups: 1, text: "[0] finds a batfly hive and catches some batflies.", chance: 0.1, effect: t => { t[0].xp += Math.floor(Math.random() * 3) + 1; } },
        { pups: 1, text: "[0] pins a batfly to a wall with their spear.", chance: 0.1, req: t => t[0].item == Item.spear, effect: t => { t[0].item == Item.empty; t[0].xp++; } },
        { pups: 2, text: "[0] forms a temporary alliance with [1] to catch batflies.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(0.2), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 1; t[1].xp += Math.floor(Math.random() * 2) + 1; } },
        { pups: 2, text: "[0] and [1] work together to catch batflies and share their haul.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(0.2), req: t => t[0].relationWith(t[1]).shared == RelationType.friends, effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; t[1].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 1, text: "[0] comes across some blue fruit and eats it.", chance: 0.2, bias: t => t[0].bias(Stat.nervousness, 0.2) + t[0].bias(Stat.energy, -0.2), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 1, text: "[0] hates the taste of blue fruit and doesn't eat any, despite finding a large amount.", chance: 0.2, bias: t => t[0].bias(Stat.nervousness, -0.2) + t[0].bias(Stat.energy, 0.2) },
        { pups: 1, text: "[0] notices a patch of slime mold glowing in a shady corner.", chance: 0.1, bias: t => t[0].bias(Stat.dominance, 0.1), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 2; } },
        { pups: 2, text: "[0] knocks down a piece of fruit, tricking [1] into thinking it's dropwig bait.", chance: 0.1, bias: t => t[0].friend(-0.1), effect: t => { t[0].xp += Math.floor(Math.random() * 2) + 1; } },
        // Friendships
        { pups: 2, text: "[0] asks [1] if they can team up. [1] gratefully accepts.", chance: 0.4, bias: t => t[0].friend(0.4) + t[1].friend(0.4), req: t => !t[0].anyRelation(t[1], RelationType.friends, RelationType.swornEnemies), effect: t => { t[0].become(RelationType.friends, t[1], true); } },
        { pups: 2, text: "[0] shares some knowledge with [1].", chance: 0.3, bias: t => t[0].friend(0.3), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { if (Math.random() < 0.5 && !t[0].anyRelation(t[1], RelationType.friends))
                t[0].become(RelationType.friends, t[1], true); } },
        { pups: 3, text: "[0] and [1] invite [2] to their friend group. [2] agrees.", chance: 0.5, bias: t => t[0].friend(0.5) + t[1].friend(0.5) + t[2].friend(0.5), req: t => t[0].relationWith(t[1]).shared == RelationType.friends && !t[0].anyRelation(t[2], RelationType.friends, RelationType.swornEnemies) && !t[1].anyRelation(t[2], RelationType.friends, RelationType.swornEnemies), effect: t => { t[0].become(RelationType.friends, t[2], true); t[1].become(RelationType.friends, t[2], true); } },
        { pups: 2, text: "[0] apologizes to [1], who forgives them.", chance: 0.8, bias: t => t[0].bias(Stat.sympathy, 0.5) + t[1].bias(Stat.sympathy, 0.5), req: t => { let x = t[0].relationWith(t[1]); return x.forth == RelationType.friends && x.back != RelationType.friends; }, effect: t => { t[1].become(RelationType.friends, t[0]); } },
        { pups: 2, text: "[0] wants to be friends with [1], but [1] politely declines.", chance: 0.2, bias: t => t[0].friend(0.2) + t[1].friend(-0.2) + t[1].bias(Stat.nervousness, 0.2), req: t => !t[0].anyRelation(t[1], RelationType.friends, RelationType.swornEnemies) },
        { pups: 2, text: "[0] accidentally says something bad about their friend [1].", chance: 0.1, bias: t => t[0].bias(Stat.energy, 0.1) + t[0].attack(-0.1), req: t => t[1].anyRelation(t[0], RelationType.friends), effect: t => { t[1].become(RelationType.default, t[0]); } },
        { pups: 2, text: "[0] changes their mind about [1]. [1] sadly parts ways with [0].", chance: 0.3, bias: t => t[0].friend(-0.3), req: t => t[0].relationWith(t[1]).forth == RelationType.friends, effect: t => { t[0].become(RelationType.default, t[1], true); } },
        // Enemyships?
        { pups: 2, text: "[1] flings rubbish, mistakenly hitting [0] and enraging them.", chance: 0.4, bias: t => t[0].friend(-0.4), req: t => t[0].relationWith(t[1]).forth != RelationType.friends && t[0].relationWith(t[1]).forth != RelationType.swornEnemies, effect: t => { t[0].become(RelationType.swornEnemies, t[1]); } },
        { pups: 2, text: "[0] decides [1] can't stay alive and swears to kill them.", chance: 0.4, bias: t => t[0].friend(-0.4), req: t => t[0].relationWith(t[1]).forth != RelationType.friends && t[0].relationWith(t[1]).forth != RelationType.swornEnemies, effect: t => { t[0].become(RelationType.swornEnemies, t[1]); } },
        { pups: 2, text: "[0] rage clears and they decide their hatred of [1] was badly placed.", chance: 0.3, bias: t => t[0].friend(0.3), req: t => t[0].relationWith(t[1]).forth == RelationType.swornEnemies, effect: t => { t[0].become(RelationType.default, t[1]); } },
        // Perks
        { pups: 1, text: "[0] finds a mushroom and eats it. They feel their senses heighten.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.08), req: t => !t[0].perks.includes(Perk.hasty), effect: t => { t[0].perks.push(Perk.hasty); } },
        { pups: 1, text: "[0] starts to question their own sanity.", chance: 0.1, bias: t => t[0].bias(Stat.nervousness, 0.1), req: t => !t[0].perks.includes(Perk.suicidal), effect: t => { if (Math.random() < 0.5)
                t[0].perks.push(Perk.suicidal); } },
        { pups: 1, text: "[0] feeds some scraps to a green lizard and wins its loyalty.", chance: 0.2, bias: t => t[0].bias(Stat.sympathy, 0.4), req: t => !t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.push(Perk.tamedLizard); } },
        { pups: 1, text: "[0] finds another lizard and convinces it to join their army.", chance: 0.4, bias: t => t[0].bias(Stat.sympathy, 0.8), req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.push(Perk.tamedLizard); } },
        // Unperks
        { pups: 1, text: "[0] feels the mushroom's effects fading.", chance: 0.7, req: t => t[0].perks.includes(Perk.hasty), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.hasty), 1); } },
        { pups: 1, text: "[0] isn't giving up just yet.", chance: 0.4, req: t => t[0].perks.includes(Perk.suicidal), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.suicidal), 1); } },
        { pups: 1, text: "[0]'s tamed lizard walks off a cliff by mistake.", chance: 0.4, req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[0].perks.splice(t[0].perks.indexOf(Perk.tamedLizard), 1); } },
        // Pickups
        { pups: 1, text: "[0] picks up a spear.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 1, text: "[0] comes across a scavenger merchant and barters for a spear with some nearby rubbish.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 2, text: "[0] discovers a spear left behind in [1]'s shelter.", chance: 0.4, bias: t => t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.aggression, 0.3), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 2, text: "[0] notices a spear that [1] mistook for a piece of rubbish.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.aggression, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.spear; } },
        { pups: 1, text: "[0] finds a grenade.", chance: 0.2, bias: t => t[0].bias(Stat.dominance, 0.1) + t[0].bias(Stat.aggression, 0.1), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.grenade; } },
        { pups: 2, text: "[0] takes a spear from [1] while they were looking the other way.", chance: 0.3, bias: t => t[0].bias(Stat.energy, -0.2) + t[0].bias(Stat.dominance, 0.2) + t[0].bias(Stat.bravery, 0.2), req: t => t[0].item == Item.empty && t[1].item == Item.spear, effect: t => { t[1].item == Item.empty; t[0].item == Item.spear; } },
        { pups: 2, text: "[0] finds a couple of spears and hands one to [1].", chance: 0.4, bias: t => t[0].bias(Stat.sympathy, 0.3) + t[0].bias(Stat.dominance, 0.2), req: t => t[0].item == Item.empty && t[1].item == Item.empty && t[0].relationWith(t[1]).forth == RelationType.friends, effect: t => { t[0].item == Item.spear; t[1].item == Item.spear; } },
        { pups: 1, text: "[0] takes a pearl from an unguarded scavenger treasury.", chance: 0.5, bias: t => t[0].bias(Stat.dominance, 0.3) + t[0].bias(Stat.energy, 0.4), req: t => t[0].item == Item.empty, effect: t => { t[0].item = Item.pearl; } },
        // Scavs
        { pups: 1, text: "[0] trades their pearl for a scavenger's grenade.", chance: 0.6, bias: t => t[0].perks.includes(Perk.highRep) ? 0.9 : 0, req: t => t[0].item == Item.pearl && !t[0].perks.includes(Perk.lowRep), effect: t => { t[0].item == Item.grenade; if (Math.random() < 0.5 && !t[0].perks.includes(Perk.highRep))
                t[0].perks.push(Perk.highRep); } },
        { pups: 2, text: "[0] purchases spears for themselves and their friend [1] with a pearl.", chance: 0.8, bias: t => t[0].perks.includes(Perk.highRep) ? 1.2 : 0, req: t => t[0].item == Item.pearl && t[0].relationWith(t[1]).forth == RelationType.friends && !t[0].perks.includes(Perk.lowRep),
            effect: t => { t[0].item == Item.spear; t[1].item == Item.spear; if (Math.random() < 0.5 && !t[0].perks.includes(Perk.highRep))
                t[0].perks.push(Perk.highRep); if (Math.random() < 0.3 && !t[1].perks.includes(Perk.highRep))
                t[1].perks.push(Perk.highRep); } },
        { pups: 1, text: "[0] throws a spear into a scavenger toll, killing one.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => t[0].item == Item.spear && !t[0].perks.includes(Perk.highRep), effect: t => { t[0].item = Item.empty; t[0].xp += 6; if (!t[0].perks.includes(Perk.lowRep))
                t[0].perks.push(Perk.lowRep); } },
        { pups: 1, text: "[0] is hunted down and killed by a patrol of scavengers.", chance: 0.4, bias: t => t[0].dodge(-0.2), req: t => t[0].perks.includes(Perk.lowRep), effect: t => { t[0].die(DeathCause.spearThrow, new Creature("Scavenger", "#ccc")); } },
        // Self Kills
        { pups: 1, text: "[0] accidentally sets off their own grenade while fiddling with it.", chance: 0.2, bias: t => t[0].bias(Stat.energy, 0.3), req: t => t[0].item == Item.grenade, effect: t => { t[0].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 1, text: "[0] can't handle this anymore and takes their own life.", chance: 0.2, req: t => t[0].perks.includes(Perk.suicidal), effect: t => { t[0].die(DeathCause.suicide, t[0]); } },
        // Creature Deaths
        { pups: 1, text: "[0] meets their end in the jaws of a red lizard.", chance: 0.1, bias: t => t[0].dodge(-0.1), effect: t => { t[0].die(DeathCause.lizard, new Creature("Red Lizard", "#f00")); } },
        { pups: 1, text: "[0] accidentally walks under a dropwig and is slashed open.", chance: 0.2, bias: t => t[0].dodge(-0.1) + t[0].bias(Stat.energy, 0.2), effect: t => { t[0].die(DeathCause.dropwig, new Creature("Dropwig", "#ccc")); } },
        // Unarmed Kills
        { pups: 2, text: "[0] and [1] get into a brawl. [0] comes out victorious.", chance: 0.3, bias: t => t[0].bias(Stat.bravery, 0.4) + t[0].attack(0.2, -0.2, t[1]) + t[1].bias(Stat.bravery, 0.4), req: t => t[0].item == Item.empty && t[1].item == Item.empty, effect: t => { t[1].die(DeathCause.brawl, t[0]); } },
        { pups: 3, text: "[0] and [1] agree that [2] needs to die. [2] is outnumbered and finished off by [0].", chance: 0.3, bias: t => (t[0].anyRelation(t[1], RelationType.friends) ? 1 : 0) + t[0].attack(0.3, -0.3, t[2]) + t[1].attack(0.3, -0.3, t[2]), req: t => !t[0].anyRelation(t[1], RelationType.swornEnemies), effect: t => { t[2].die(DeathCause.brawl, t[0]); } },
        { pups: 2, text: "[0] challenges [1] to a brawl, but regrets it as [1] wipes the floor with them.", chance: 0.3, bias: t => t[0].bias(Stat.bravery, 0.4) + t[0].attack(0.2) + t[1].attack(0.2, 0.2, t[0]), req: t => t[0].item == Item.empty && t[1].item == Item.empty, effect: t => { t[0].die(DeathCause.brawl, t[1]); } },
        // Item Kills
        { pups: 2, text: "[0] fires a spear straight at [1]'s head, killing them instantly.", chance: 0.5, bias: t => t[0].attack(0.5, -0.5, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.spearThrow, t[0]); } },
        { pups: 2, text: "[0] discovers [1] trying to catch batflies and spears them while their back is turned.", chance: 0.5, bias: t => t[0].attack(0.5, -0.3, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.backstab, t[0]); } },
        { pups: 3, text: "[0] distracts [1] while their friend [2] comes up from behind and stabs them.", chance: 0.8, bias: t => t[2].attack(0.6, -0.2, t[1]) + t[0].friend(0.4) + t[2].friend(0.4), req: t => t[2].item == Item.spear && t[2].relationWith(t[0]).forth == RelationType.friends,
            effect: t => { t[2].item = Item.empty; t[1].die(DeathCause.backstab, t[2]); } },
        { pups: 2, text: "[0] sneaks up behind [1] and stabs them.", chance: 0.3, bias: t => t[0].attack(0.3, -0.1, t[1]) + t[0].bias(Stat.energy, -0.2), req: t => t[0].item == Item.spear, effect: t => { t[1].die(DeathCause.backstab, t[0]); } },
        { pups: 2, text: "[0] throws a grenade at [1], killing them in the explosion.", chance: 0.5, bias: t => t[0].attack(0.5, -0.3, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 3, text: "[0] catches [1] and [2] with a well-placed grenade explosion.", chance: 0.4, bias: t => t[0].attack(0.4, -0.2, t[1], t[2]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; t[1].die(DeathCause.grenadeExplosion, t[0]); t[2].die(DeathCause.grenadeExplosion, t[0]); } },
        { pups: 1, text: "[0] stabs a lizard to death with a spear.", chance: 0.3, bias: t => t[0].attack(0.3), req: t => t[0].item == Item.spear, effect: t => { t[0].xp += Math.floor(Math.random() * 4) + 5; } },
        // Failed Items
        { pups: 2, text: "[0] aims a spear at [1], but [1] dodges just in time.", chance: 0.3, bias: t => t[0].attack(0.3, 0.3, t[1]), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 1, text: "[0] has a spear taken off their back by a garbage worm.", chance: 0.2, bias: t => t[0].dodge(-0.2), req: t => t[0].item == Item.spear, effect: t => { t[0].item = Item.empty; } },
        { pups: 2, text: "[0] was about to spear [1], but an overseer pointed them out and they ran.", chance: 0.3, bias: t => t[0].attack(0.3, 0, t[1]), req: t => t[0].item == Item.spear },
        { pups: 2, text: "[0] flings their grenade at [1], but misses.", chance: 0.2, bias: t => t[0].attack(0.2, 0.1, t[1]), req: t => t[0].item == Item.grenade, effect: t => { t[0].item = Item.empty; } },
        // Perk Kills
        { pups: 2, text: "[0] sics their pet lizard on [1]. [1] can't escape and dies to its bite.", chance: 0.5, bias: t => t[0].attack(0.5, -0.5, t[1]), req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizard", randomColor())); } },
        { pups: 2, text: "[0] can't keep their lizard under control, resulting in [1] being bitten and killed.", chance: 0.3, req: t => t[0].perks.includes(Perk.tamedLizard), effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizard", randomColor())); } },
        { pups: 2, text: "[0] sends their lizard followers to attack [1]. [1] is surrounded and killed.", chance: 0.8, bias: t => t[0].attack(0.8, -0.2, t[1]), req: t => t[0].perks.filter(x => x == Perk.tamedLizard).length >= 2, effect: t => { t[1].die(DeathCause.lizard, new Creature(t[0].name + "'s Lizards", randomColor())); } },
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
                if (i.action.pups.length < i.action.action.pups)
                    alert("uh oh! action '" + i.action.action.text + "' got " + i.action.pups.length + "/" + i.action.action.pups);
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
                            t = t.replaceAll(`[${p}]`, i.action.pups[p].name);
                        }
                        t = t.replaceAll("[R]", i.output);
                        text.textContent = t;
                        text.classList.add("actiontext");
                        actionUI.appendChild(text);
                        getId("gamepups").appendChild(actionUI);
                    }
                    let scoreUI = document.createElement("div");
                    scoreUI.id = "scoreui";
                    for (let i of Game.pups.sort((a, b) => b.xp - a.xp)) {
                        let image = document.createElement("img");
                        image.src = i.dead ? "./assets/slugdead.png" : "./assets/slugpup.png";
                        image.style.background = i.color;
                        image.classList.add("pupimg", "small");
                        scoreUI.appendChild(image);
                        let text = document.createElement("span");
                        if (i.dead)
                            text.style.color = "#bbb";
                        text.classList.add("scoretext");
                        text.textContent = `${i.name} - ${i.xp} XP`;
                        if (i.dead && !i.killedBy && !i.deathCause)
                            text.insertAdjacentText("beforeend", " - dead");
                        if (!i.dead)
                            text.insertAdjacentText("beforeend", " - alive" + (i.perks.length ? ", " : "") + i.perks.join(", ") + (i.item == Item.empty ? "" : ", holding " + i.item));
                        for (let j of Game.pups) {
                            if (i.relationWith(j).forth != RelationType.default) {
                                text.insertAdjacentText("beforeend", ", " + i.relationWith(j).forth + " with ");
                                let coloredText = document.createElement("span");
                                coloredText.style.color = j.color;
                                coloredText.textContent = j.name;
                                text.appendChild(coloredText);
                                if (j.dead)
                                    text.insertAdjacentText("beforeend", "†");
                            }
                        }
                        if (i.kills)
                            text.insertAdjacentText("beforeend", ", " + i.kills + " kill" + (i.kills == 1 ? "" : "s"));
                        if (i.killedBy || i.deathCause)
                            text.insertAdjacentText("beforeend", " - killed");
                        if (i.killedBy) {
                            text.insertAdjacentText("beforeend", " by ");
                            let coloredText = document.createElement("span");
                            coloredText.style.color = i.killedBy.color;
                            coloredText.textContent = i.killedBy.name;
                            text.appendChild(coloredText);
                        }
                        if (i.deathCause)
                            text.insertAdjacentText("beforeend", " (" + i.deathCause + ")");
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
