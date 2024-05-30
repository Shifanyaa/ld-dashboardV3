import { writable } from "svelte/store";

export const strikesresult = writable([]);

export function updateStrikesResult(data){
    strikesresult.set(data);
}