/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Race, Rarity } from "../types";

export const RACES_LIST: Race[] = [
  {
    id: "human",
    name: "Human",
    rarity: Rarity.COMMON,
    rollChance: 0.50,
    description: "Highly adaptable and eager to learn. Grants a permanent boost to Experience gain.",
    statsBonus: {
      expMultiplierBonus: 0.15,
    },
  },
  {
    id: "elf",
    name: "Elf",
    rarity: Rarity.UNCOMMON,
    rollChance: 0.25,
    description: "Graceful and precise. Grants increased Dodge Chance (Agility) and Critical Hit Rate.",
    statsBonus: {
      agilityBonus: 0.10,
      critRateBonus: 0.08,
    },
  },
  {
    id: "dwarf",
    name: "Dwarf",
    rarity: Rarity.RARE,
    rollChance: 0.15,
    description: "Sturdy and relentless. Grants massive Max Health and increased Base Strength.",
    statsBonus: {
      maxHpPercent: 0.20,
      strengthPercent: 0.15,
    },
  },
  {
    id: "orc",
    name: "Orc",
    rarity: Rarity.EPIC,
    rollChance: 0.08,
    description: "Fueled by battle fury. Grants extreme Critical Hit Damage and raw Base Strength.",
    statsBonus: {
      critDamageBonus: 0.35,
      strengthPercent: 0.20,
    },
  },
  {
    id: "dragonkin",
    name: "Dragonkin",
    rarity: Rarity.LEGENDARY,
    rollChance: 0.02,
    description: "Descendant of ancient fire lords. Ultimate multipliers to Damage, Coin, and Experience gain.",
    statsBonus: {
      strengthPercent: 0.25,
      coinMultiplierBonus: 0.25,
      expMultiplierBonus: 0.25,
    },
  },
  {
    id: "aetherian_overlord",
    name: "Aetherian Overlord",
    rarity: Rarity.MYTHICAL,
    rollChance: 0.005,
    description: "Requires Prestige 200. Supreme master of the void. Grants massive +40% Strength, +40% Max HP, +30% Dodge (Agility), and +50% Coin & EXP multipliers.",
    statsBonus: {
      strengthPercent: 0.40,
      maxHpPercent: 0.40,
      agilityBonus: 0.30,
      coinMultiplierBonus: 0.50,
      expMultiplierBonus: 0.50,
    },
  },
];
