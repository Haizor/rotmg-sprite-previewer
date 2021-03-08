import { writable } from "svelte/store";
import { BrowserLoader } from "rotmg-utils"

export const sprite = writable(null);
export const mask = writable(null);

export const browserLoader = new BrowserLoader({
    dyeLoader: true
});

export const isElectron = window.api !== undefined;

export const loading = browserLoader.load();

window.setSprite = (sprite) => {
    sprite.set(sprite);
}