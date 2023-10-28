import { getId, Stat, randomColor, choiceStr } from "./globals.js";
import { Slugpup } from "./slugpup.js";
import { Game } from "./game.js";

export function addPup() {
    let pups = getId("pups");
    let color = randomColor();
    let pupUI = document.createElement("div");
    pupUI.classList.add("pup");
    let image = document.createElement("img");
    image.src = "./assets/slugpup.png";
    image.style.background = color;
    image.classList.add("pupimg");
    pupUI.appendChild(image);
    let btn = document.createElement("button");
    btn.textContent = "Show Stats";
    btn.onclick = function() {
        let statsElem = btn.parentElement.getElementsByClassName("pupstats")[0] as HTMLElement;
        if(parseInt(statsElem.style.opacity) == 1) {
            btn.textContent = "Show Stats";
            statsElem.style.opacity = "0";
        } else {
            btn.textContent = "Hide Stats";
            statsElem.style.opacity = "1";
        }
    }
    btn.classList.add("statbutton");
    pupUI.appendChild(btn);
    let btn2 = document.createElement("button");
    btn2.textContent = "Randomize Stats";
    btn2.onclick = function() {
        let statsElem = btn2.parentElement.getElementsByClassName("pupstats")[0] as HTMLElement;
        let bars = Array.from(statsElem.getElementsByClassName("statbar")) as HTMLInputElement[];
        for(let i of bars) {
            let value = Math.floor(Math.random() * 101).toString();
            i.value = value;
            let stat = Array.from(i.parentElement.parentElement.getElementsByClassName("statname")).filter(x => (Array.from(i.classList).filter(y => x.classList.contains(y))).length > 0)[0].textContent;
            let txt = i.parentElement.getElementsByClassName("txt")[0] as HTMLElement;
            txt.textContent = stat + ": " + value;
        }
    }
    btn2.classList.add("rollbutton");
    pupUI.appendChild(btn2);
    let picker = document.createElement("input");
    picker.type = "color";
    picker.value = color;
    picker.onchange = function() {
        (pupUI.getElementsByClassName("pupimg")[0] as HTMLElement).style.background = picker.value;
        (Array.from(pupUI.getElementsByClassName("statbar")) as HTMLElement[]).forEach(x => {x.style.background = picker.value;});
    }
    picker.classList.add("picker");
    pupUI.appendChild(picker);
    let name = document.createElement("input");
    name.placeholder = "Unnamed Slugpup";
    let fakeName = "";
    for(let j = 0; j < Math.floor(Math.random() * 3) + 2; j++) {
        for(let k = 0; k < Math.floor(Math.random() * 3.5); k++) {
            fakeName += choiceStr("bbcddfghjkllmnnnpqrrrssstttvwxyz");
        }
        fakeName += choiceStr("aeiou");
    }
    for(let k = 0; k < Math.floor(Math.random() * 2.5); k++) {
        fakeName += choiceStr("bbcddfghjkllmnnnpqrrrssstttvwxyz");
    }
    name.value = fakeName[0].toUpperCase() + fakeName.slice(1);
    name.classList.add("pupname");
    pupUI.appendChild(name);
    let stats = document.createElement("div");
    stats.classList.add("pupstats");
    for(let i of Object.keys(Stat)) {
        let name = document.createElement("div");
        name.classList.add("statname", i);
        name.textContent = i;
        stats.appendChild(name);
        let input = document.createElement("input");
        input.type = "range";
        input.classList.add("statbar", i);
        input.min = "0";
        input.max = "100";
        input.value = Math.floor(Math.random() * 101).toString();
        let txt = document.createElement("span");
        txt.classList.add("txt");
        setInterval(function() {
            txt.textContent = i + ": " + input.value;
        }, 50);
        let dummy = document.createElement("span");
        dummy.classList.add("dummy");
        dummy.appendChild(input);
        dummy.appendChild(txt);
        stats.appendChild(dummy);
        stats.appendChild(document.createElement("br"));
    }
    stats.style.opacity = "0";
    pupUI.appendChild(stats);
    Array.from(pupUI.querySelectorAll('input[type="range"]')).forEach(x => {(x as HTMLElement).style.background = color;});
    pups.appendChild(pupUI);
}

export function beginGame() {
    let pups = Array.from(getId("pups").children);
    for(let i of pups) {
        let statbars = Array.from(i.getElementsByClassName("statbar")) as HTMLInputElement[];
        let pup = new Slugpup();
        pup.color = (i.getElementsByClassName("statbar")[0] as HTMLElement).style.background;
        pup.name = (i.getElementsByClassName("pupname")[0] as HTMLInputElement).value || "an unnamed slugpup";
        let x = 0;
        for(let i of Object.keys(Stat).slice(0, 6)) {
            pup.stats[Stat[i]] = statbars[x].value; x++;
        }
        Game.pups.push(pup);
    }
    getId("setup").style.right = "100%";
    Game.nextRound();
}