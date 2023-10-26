import { getId, Stats } from "./globals.js";
export function addPup() {
    // Add a new slugpup to the UI
    let pups = getId("pups");
    let pup = document.createElement("div");
    pup.classList.add("pup");
    let image = document.createElement("img");
    image.src = "./assets/slugpup.png";
    image.classList.add("pupimg");
    pup.appendChild(image);
    let btn = document.createElement("button");
    btn.textContent = "Show Stats";
    btn.classList.add("statbutton");
    pup.appendChild(btn);
    let input = document.createElement("input");
    input.placeholder = "Slugpup's Name";
    input.classList.add("name");
    pup.appendChild(input);
    let stats = document.createElement("div");
    stats.classList.add("pupstats");
    for (let i of Object.keys(Stats)) {
        stats.insertAdjacentHTML("beforeend", i + "<br/>");
    }
    pup.appendChild(stats);
    pups.appendChild(pup);
}
