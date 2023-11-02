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
    btn.classList.add("statbutton", "core");
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
    btn2.classList.add("rollbutton", "core");
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
    name.classList.add("pupname", "core");
    pupUI.appendChild(name);
    let customPrns = document.createElement("div");
    customPrns.classList.add("customprns");
    customPrns.style.opacity = "0";
    customPrns.innerText = "Set custom pronouns: ";
    for(let i of ["they", "them", "their"]) {
        let input = document.createElement("input");
        input.classList.add("customprn", "core", i);
        input.placeholder = i;
        customPrns.appendChild(input);
        if(i != "their") customPrns.insertAdjacentText("beforeend", " / ");
    }
    let prns = document.createElement("select");
    prns.classList.add("pronouns");
    let selected = false;
    for(let i of ["he/him", "she/her", "they/them", "custom"]) {
        let option = document.createElement("option");
        option.value = i;
        option.innerText = i;
        if(!selected && (i == "they/them" || Math.random() < 0.3)) {
            selected = true;
            option.selected = true;
        }
        prns.appendChild(option);
    }
    prns.onchange = function() {
        if(prns.value == "custom") customPrns.style.opacity = "1";
        else customPrns.style.opacity = "0";
    }
    pupUI.appendChild(prns);
    pupUI.appendChild(customPrns);
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

export function beginGame() { try {
    let pups = Array.from(getId("pups").children);
    for(let i of pups) {
        let statbars = Array.from(i.getElementsByClassName("statbar")) as HTMLInputElement[];
        let pup = new Slugpup();
        pup.color = (i.getElementsByClassName("statbar")[0] as HTMLElement).style.background;
        pup.name = (i.getElementsByClassName("pupname")[0] as HTMLInputElement).value || "an unnamed slugpup";
        let prns = (i.getElementsByClassName("pronouns")[0] as HTMLSelectElement).value;
        if(prns == "custom") {
            let they = (i.getElementsByClassName("they")[0] as HTMLInputElement).value || "they";
            let them = (i.getElementsByClassName("them")[0] as HTMLInputElement).value || "them";
            let their = (i.getElementsByClassName("their")[0] as HTMLInputElement).value || "their";
            pup.pronouns = {they: they, them: them, their: their};
        } else {
            let parts = prns.split("/");
            pup.pronouns = {they: parts[0], them: parts[1], their: parts[0] == "they" ? "their" : parts[0] == "he" ? "his" : parts[1]};
        }
        let x = 0;
        for(let i of Object.keys(Stat).slice(0, 6)) {
            pup.stats[Stat[i]] = statbars[x].value; x++;
        }
        Game.pups.push(pup);
    }
    getId("setup").style.right = "100%";
    Game.nextRound();
} catch(e) { alert(e); } }