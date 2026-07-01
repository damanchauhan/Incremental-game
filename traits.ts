/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trait, Rarity } from "../types";

export const TRAITS_LIST: Trait[] = [
  {
    id: "bloodlust",
    name: "Bloodlust",
    rarity: Rarity.COMMON,
    rollChance: 0.40,
    description: "Heal for 5% of your Max HP on every successful combat attack.",
    effectType: "lifesteal",
    value: 0.05,
  },
  {
    id: "gold_digger",
    name: "Gold Digger",
    rarity: Rarity.UNCOMMON,
    rollChance: 0.30,
    description: "Your coin earnings increase dynamically by 1% for every 10 character levels achieved.",
    effectType: "goldScaling",
    value: 0.01,
  },
  {
    id: "adrenaline",
    name: "Adrenaline",
    rarity: Rarity.RARE,
    rollChance: 0.18,
    description: "When your Health drops below 40%, your Critical Hit Rate increases by a massive +25%.",
    effectType: "adrenaline",
    value: 0.25,
  },
  {
    id: "time_warp",
    name: "Time Warp",
    rarity: Rarity.EPIC,
    rollChance: 0.10,
    description: "Warp time itself, reducing your combat attack cooldown interval by 15% (faster manual & auto attacks).",
    effectType: "timewarp",
    value: 0.15,
  },
  {
    id: "double_strike",
    name: "Double Strike",
    rarity: Rarity.LEGENDARY,
    rollChance: 0.02,
    description: "A legendary talent giving a 15% chance to land two strikes in a single combat turn.",
    effectType: "doublestrike",
    value: 0.15,
  },
  {
    id: "cosmic_ascension",
    name: "Cosmic Ascension",
    rarity: Rarity.MYTHICAL,
    rollChance: 0.005,
    description: "Requires Prestige 200. Ultimate celestial passive giving +10% Life Steal, +20% Double Strike chance, +75% Crit Damage, and -25% Attack Cooldown.",
    effectType: "cosmic",
    value: 1.00,
  },
];
