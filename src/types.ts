/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Rarity {
  COMMON = "Common",
  UNCOMMON = "Uncommon",
  RARE = "Rare",
  EPIC = "Epic",
  LEGENDARY = "Legendary",
  MYTHICAL = "Mythical",
}

export interface Race {
  id: string;
  name: string;
  rarity: Rarity;
  rollChance: number; // e.g. 0.50 for 50%
  description: string;
  statsBonus: {
    maxHpPercent?: number;
    strengthPercent?: number;
    critRateBonus?: number;
    critDamageBonus?: number;
    agilityBonus?: number;
    coinMultiplierBonus?: number;
    expMultiplierBonus?: number;
  };
}

export interface Trait {
  id: string;
  name: string;
  rarity: Rarity;
  rollChance: number;
  description: string;
  effectType: "lifesteal" | "goldScaling" | "adrenaline" | "timewarp" | "doublestrike" | "cosmic";
  value: number; // e.g. 0.05 for 5% lifesteal
}

export interface Enemy {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  damage: number;
  expReward: number;
  coinReward: number;
  isBoss: boolean;
  imageSeed: string; // Used for unique visual generator
  areaName: string;
  imageUrl?: string;
}

export interface PlayerStats {
  level: number;
  exp: number;
  coins: number;
  gems: number;
  prestige: number;
  prestigePoints: number; // Unspent prestige currency if any
  raceId: string;
  traitIds: string[];
  
  // Temporary upgrades (reset on prestige)
  tempStrengthLevel: number;
  tempHpLevel: number;
  tempAgilityLevel: number;
  tempCritLevel: number;
  tempCritDmgLevel: number;

  // Permanent upgrades (kept on prestige)
  permCoinMultLevel: number;
  permExpMultLevel: number;
  permDamageMultLevel: number;
  permAutoSpeedLevel: number;
  
  // Premium unlocks
  hasXpBoost: boolean;
  hasCoinBoost: boolean;
  hasAutoBattleUnlocked: boolean;
  hasPrestigeEnhancement: boolean;
  hasVipStatus: boolean;
  hasKeepItemsOnPrestige: boolean;
  hasXpRetention: boolean;

  // Sound settings
  musicVolume: number; // 0 to 100
  sfxVolume: number;   // 0 to 100
  soundOn: boolean;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  valuePerLevel: number;
}

export interface CombatLog {
  id: string;
  type: "player_attack" | "enemy_attack" | "player_dodge" | "player_crit" | "defeat" | "victory" | "level_up";
  message: string;
  timestamp: number;
}

export interface LeaderboardPlayer {
  id: string;
  name: string;
  level: number;
  prestige: number;
  raceName: string;
  rarity: Rarity;
  traits: string[];
  coins: number;
  totalDamage: number;
  isRealPlayer?: boolean;
}

export interface WorldBoss {
  name: string;
  maxHp: number;
  currentHp: number;
  level: number;
  timeRemaining: number; // in seconds
  totalContributions: number;
}

export interface Equipment {
  id: string;
  name: string;
  slot: "weapon" | "armor" | "helmet" | "accessory";
  rarity: Rarity;
  level: number;
  requiredLevel: number;
  sellValue: number;
  upgradeCost: number;
  stats: {
    strength?: number;
    maxHp?: number;
    critRate?: number;
    critDamage?: number;
    dodge?: number;
    coinMult?: number;
    expMult?: number;
  };
  setName?: string;
}

