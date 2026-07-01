/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Equipment, Rarity } from "../types";

const WEAPON_NAMES: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Wooden Practice Sword", "Rusty Bronze Dagger", "Crude Iron Mace", "Novice Oak Staff"],
  [Rarity.UNCOMMON]: ["Tempered Steel Broadsword", "Sharpened Iron Gladius", "Reinforced Steel Glaive", "Yew Shortbow"],
  [Rarity.RARE]: ["Shadow Carver", "Void Crescent Blade", "Dragontooth Dagger", "Gilded Mithril Rapier"],
  [Rarity.EPIC]: ["Astral Dawnblade", "Doomcaller Greatsword", "Mythril Sunfire Spear", "Spellsinger Wand"],
  [Rarity.LEGENDARY]: ["Eternity's Edge", "Celestial Ruin Piercer", "Starfury Greatsword", "Voidreaver Scythe"],
  [Rarity.MYTHICAL]: ["Aetherion's Void-Slicer", "Celestial Sun-Cleaver", "Grip of the Voidlord", "Supernova Star-Staff"]
};

const ARMOR_NAMES: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Ragged Cotton Tunic", "Cured Leather Vest", "Rusty Chain Vest", "Tattered Cloak"],
  [Rarity.UNCOMMON]: ["Reinforced Leather Jerkin", "Heavy Iron Hauberk", "Tempered Steel Chestplate", "Novice Robes"],
  [Rarity.RARE]: ["Shadowweave Cloak", "Gilded Guardian Aegis", "Mithril Chainmail", "Runed Robes"],
  [Rarity.EPIC]: ["Dragonscale Mail", "Obsidian Heavy Plate", "Spellweaver Garb", "Voidward Carapace"],
  [Rarity.LEGENDARY]: ["Archangel's Bulwark", "Celestial Light Plate", "Godslayer Shroud", "Cosmic Ward Robes"],
  [Rarity.MYTHICAL]: ["Aetherion's Void-Shroud", "Celestial Sunfire Plate", "Voidlord Carapace", "Supernova Cloak"]
};

const HELMET_NAMES: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Cloth Scavenger Hood", "Simple Leather Cap", "Battered Iron Bucket", "Faded Bandana"],
  [Rarity.UNCOMMON]: ["Iron Kettle Helm", "Steel Great Helm", "Guardian Visor", "Apprentice Cowl"],
  [Rarity.RARE]: ["Shadow Ranger Hood", "Gilded Circlet", "Heavy Steel Barbuta", "Vanguard Crown"],
  [Rarity.EPIC]: ["Obsidian Horned Helm", "Archmage Runed Crown", "Dragon Skull Coif", "Aether Mask"],
  [Rarity.LEGENDARY]: ["Crown of Eternal Starfire", "Godslayer War-Visor", "Halo of Celestial Radiance", "Nexus Gaze"],
  [Rarity.MYTHICAL]: ["Aetherion's Void-Crown", "Celestial Sun-Visor", "Horn of the Voidlord", "Supernova Circlet"]
};

const ACCESSORY_NAMES: Record<Rarity, string[]> = {
  [Rarity.COMMON]: ["Copper Ring", "Brass Pendant", "Lucky Rabbit Foot", "String Bracelet"],
  [Rarity.UNCOMMON]: ["Silver Signet Ring", "Onyx Bead Pendant", "Tiger Eye Brooch", "Polished Jade Charm"],
  [Rarity.RARE]: ["Noble Jade Band", "Heart-shaped Ruby Amulet", "Sapphire Choker", "Windrunner Feather"],
  [Rarity.EPIC]: ["Chrono Hourglass", "Abyssal Void Ring", "Demon Heart Pendant", "Sunfire Talisman"],
  [Rarity.LEGENDARY]: ["Eye of Eternity", "Cosmic Band of Power", "Supernova Star Core", "Genesis Relic"],
  [Rarity.MYTHICAL]: ["Aetherion's Void-Band", "Celestial Sun-Pendant", "Signet of the Voidlord", "Supernova Ring"]
};

export const generateLootItem = (monsterLevel: number): Equipment => {
  const slots: ("weapon" | "armor" | "helmet" | "accessory")[] = [
    "weapon",
    "armor",
    "helmet",
    "accessory",
  ];
  const slot = slots[Math.floor(Math.random() * slots.length)];

  // Determine Rarity based on random rolls
  // 70% Common, 18% Uncommon, 8% Rare, 3% Epic, 1% Legendary
  const roll = Math.random() * 100;
  let rarity = Rarity.COMMON;
  let rarityMult = 1;

  if (roll < 1) {
    rarity = Rarity.LEGENDARY;
    rarityMult = 4.5;
  } else if (roll < 4) {
    rarity = Rarity.EPIC;
    rarityMult = 2.8;
  } else if (roll < 12) {
    rarity = Rarity.RARE;
    rarityMult = 1.8;
  } else if (roll < 30) {
    rarity = Rarity.UNCOMMON;
    rarityMult = 1.3;
  }

  // Get Name
  let namesPool = WEAPON_NAMES[rarity];
  if (slot === "armor") namesPool = ARMOR_NAMES[rarity];
  else if (slot === "helmet") namesPool = HELMET_NAMES[rarity];
  else if (slot === "accessory") namesPool = ACCESSORY_NAMES[rarity];

  const baseName = namesPool[Math.floor(Math.random() * namesPool.length)];
  const name = `${baseName} (iLvl ${monsterLevel})`;

  // Calculate Base Stats scaled by level and rarity
  const stats: Equipment["stats"] = {};
  
  // Base scaling factors
  const baseHpScale = 8 + monsterLevel * 4;
  const baseStrScale = 1.5 + monsterLevel * 0.8;

  if (slot === "weapon") {
    stats.strength = Math.round(baseStrScale * rarityMult);
    if (Math.random() < 0.4) {
      stats.critRate = parseFloat((0.01 + (monsterLevel * 0.001) * rarityMult).toFixed(3));
    }
    if (Math.random() < 0.4) {
      stats.critDamage = parseFloat((0.05 + (monsterLevel * 0.005) * rarityMult).toFixed(3));
    }
  } else if (slot === "armor") {
    stats.maxHp = Math.round(baseHpScale * 1.5 * rarityMult);
    if (Math.random() < 0.4) {
      stats.dodge = parseFloat((0.005 + (monsterLevel * 0.0005) * rarityMult).toFixed(3));
    }
  } else if (slot === "helmet") {
    stats.maxHp = Math.round(baseHpScale * rarityMult);
    stats.strength = Math.round(baseStrScale * 0.4 * rarityMult);
  } else if (slot === "accessory") {
    // Accessories give utility & multipliers
    if (Math.random() < 0.5) {
      stats.coinMult = parseFloat((0.02 + (monsterLevel * 0.002) * rarityMult).toFixed(3));
    }
    if (Math.random() < 0.5) {
      stats.expMult = parseFloat((0.02 + (monsterLevel * 0.002) * rarityMult).toFixed(3));
    }
    if (Math.random() < 0.3) {
      stats.critRate = parseFloat((0.008 + (monsterLevel * 0.0008) * rarityMult).toFixed(3));
    }
  }

  // Enforce at least one stat
  if (Object.keys(stats).length === 0) {
    if (slot === "weapon") stats.strength = Math.round(baseStrScale * rarityMult);
    else stats.maxHp = Math.round(baseHpScale * rarityMult); // default backup
  }

  const id = `eq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sellValue = Math.round(15 * monsterLevel * rarityMult);
  const upgradeCost = Math.round(25 * monsterLevel * rarityMult);

  return {
    id,
    name,
    slot,
    rarity,
    level: 1,
    requiredLevel: Math.max(1, Math.floor(monsterLevel * 0.8)),
    sellValue,
    upgradeCost,
    stats,
  };
};

export const generateMythicalSetItem = (
  playerLevel: number,
  setName?: "Aetherion's Voidlord" | "Celestial Sunfire",
  slot?: "weapon" | "armor" | "helmet" | "accessory"
): Equipment => {
  const selectedSetName = setName || (Math.random() < 0.5 ? "Aetherion's Voidlord" : "Celestial Sunfire");
  const slots: ("weapon" | "armor" | "helmet" | "accessory")[] = ["weapon", "armor", "helmet", "accessory"];
  const selectedSlot = slot || slots[Math.floor(Math.random() * slots.length)];

  let name = "";
  const stats: Equipment["stats"] = {};

  if (selectedSetName === "Aetherion's Voidlord") {
    switch (selectedSlot) {
      case "weapon":
        name = "🌌 Voidlord's Singularity Edge";
        stats.strength = 150 + playerLevel * 3;
        stats.critRate = 0.15;
        stats.critDamage = 0.75;
        break;
      case "helmet":
        name = "🌌 Voidlord's Gaze of Infinity";
        stats.maxHp = 800 + playerLevel * 10;
        stats.strength = 50 + playerLevel * 1.5;
        stats.critRate = 0.08;
        break;
      case "armor":
        name = "🌌 Voidlord's Astral Plate";
        stats.maxHp = 2000 + playerLevel * 25;
        stats.dodge = 0.10;
        break;
      case "accessory":
        name = "🌌 Voidlord's Gravity Warp";
        stats.coinMult = 0.50;
        stats.expMult = 0.50;
        stats.strength = 80 + playerLevel * 2;
        break;
    }
  } else {
    // Celestial Sunfire Set
    switch (selectedSlot) {
      case "weapon":
        name = "🔥 Sunfire Solstice Scepter";
        stats.strength = 180 + playerLevel * 3.5;
        stats.critDamage = 1.20;
        break;
      case "helmet":
        name = "🔥 Sunfire Crest of the Phoenix";
        stats.maxHp = 1000 + playerLevel * 12;
        stats.critRate = 0.12;
        break;
      case "armor":
        name = "🔥 Sunfire Solar Carapace";
        stats.maxHp = 2500 + playerLevel * 30;
        stats.dodge = 0.12;
        break;
      case "accessory":
        name = "🔥 Sunfire Ignited Star";
        stats.coinMult = 0.60;
        stats.expMult = 0.60;
        stats.dodge = 0.08;
        break;
    }
  }

  const id = `mythic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const sellValue = 5000 + playerLevel * 20;
  const upgradeCost = 8000 + playerLevel * 30;

  return {
    id,
    name: `${name} (iLvl ${playerLevel + 15})`,
    slot: selectedSlot,
    rarity: Rarity.MYTHICAL,
    level: 1,
    requiredLevel: playerLevel,
    sellValue,
    upgradeCost,
    stats,
    setName: selectedSetName,
  };
};

