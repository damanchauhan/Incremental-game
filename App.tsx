/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Swords,
  Users,
  Award,
  Gem,
  Compass,
  Coins,
  RefreshCw,
  Skull,
  Flame,
  Shield,
  Heart,
  Play,
  Square,
  Sparkles,
  Zap,
  Info,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
import { PlayerStats, Enemy, Rarity, CombatLog, Equipment } from "./types";

// Audio Synth Engine
import { audio } from "./audio";

// Loot Utilities
import { generateLootItem } from "./utils/lootGenerator";

// Static Lists
import { GAME_AREAS, GameArea } from "./data/enemies";
import { RACES_LIST } from "./data/races";
import { TRAITS_LIST } from "./data/traits";

// Sub-panels
import AudioControls from "./components/AudioControls";
import FloatingCombatText, { FloatingText } from "./components/FloatingCombatText";
import LeaderboardPanel from "./components/LeaderboardPanel";
import BossRaidPanel from "./components/BossRaidPanel";
import CharacterGacha from "./components/CharacterGacha";
import UpgradesShop from "./components/UpgradesShop";
import PremiumPanel from "./components/PremiumPanel";
import SavesPanel from "./components/SavesPanel";
import PrestigePanel from "./components/PrestigePanel";
import InventoryPanel from "./components/InventoryPanel";

// Default State Creator
const createInitialPlayerState = (): PlayerStats => ({
  level: 1,
  exp: 0,
  coins: 50,
  gems: 10,
  prestige: 0,
  prestigePoints: 0,
  raceId: "human",
  traitIds: [],
  tempStrengthLevel: 0,
  tempHpLevel: 0,
  tempAgilityLevel: 0,
  tempCritLevel: 0,
  tempCritDmgLevel: 0,
  permCoinMultLevel: 0,
  permExpMultLevel: 0,
  permDamageMultLevel: 0,
  permAutoSpeedLevel: 0,
  hasXpBoost: false,
  hasCoinBoost: false,
  hasAutoBattleUnlocked: false,
  hasPrestigeEnhancement: false,
  hasVipStatus: false,
  musicVolume: 35,
  sfxVolume: 50,
  soundOn: false,
});

export default function App() {
  // --- Game core states ---
  const [playerState, setPlayerState] = useState<PlayerStats>(createInitialPlayerState());
  const [savedName, setSavedName] = useState<string>("");
  const [activeAreaId, setActiveAreaId] = useState<string>("woods");
  const [activeEnemy, setActiveEnemy] = useState<Enemy>(GAME_AREAS[0].enemies[0]);
  const [enemyHp, setEnemyHp] = useState<number>(GAME_AREAS[0].enemies[0].maxHp);
  const [playerHp, setPlayerHp] = useState<number>(100);
  
  // Tabs & Views
  const [activeTab, setActiveTab] = useState<"combat" | "upgrades" | "gacha" | "multiplayer" | "raid" | "premium" | "saves" | "prestige" | "inventory">("combat");
  
  // Loot Equipment States
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [equipped, setEquipped] = useState<Record<string, Equipment | null>>({
    weapon: null,
    armor: null,
    helmet: null,
    accessory: null,
  });
  const [autoSellSettings, setAutoSellSettings] = useState<Record<string, boolean>>({
    [Rarity.COMMON]: false,
    [Rarity.UNCOMMON]: false,
    [Rarity.RARE]: false,
    [Rarity.EPIC]: false,
    [Rarity.LEGENDARY]: false,
  });
  
  // Tokens
  const [raceRollsOwned, setRaceRollsOwned] = useState<number>(3);
  const [traitRollsOwned, setTraitRollsOwned] = useState<number>(0);
  
  // Fight mechanics
  const [autoBattleActive, setAutoBattleActive] = useState<boolean>(false);
  const [isCombatCooldown, setIsCombatCooldown] = useState<boolean>(false);
  const [isPlayerDying, setIsPlayerDying] = useState<boolean>(false);
  const [isPlayerAttacking, setIsPlayerAttacking] = useState<boolean>(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState<boolean>(false);
  const [prestigeAnimate, setPrestigeAnimate] = useState<boolean>(false);

  // Floating text / Damage display
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([]);

  // Sound trackers to prevent initial audio block
  const audioInitializedRef = useRef(false);

  // --- Calculations ---
  const activeArea = GAME_AREAS.find((a) => a.id === activeAreaId) || GAME_AREAS[0];
  const activeRace = RACES_LIST.find((r) => r.id === playerState.raceId) || RACES_LIST[0];

  // Progressive Experience Requirements: level 1 = 100, level 2 = 122, level 3 = 148, level 10 = ~600, etc.
  const getExpNeededForNextLevel = (lvl: number) => {
    return Math.floor(100 * Math.pow(1.22, lvl - 1));
  };
  const expNeeded = getExpNeededForNextLevel(playerState.level);

  // Stats calculation
  const getEquippedSetCount = (setName: string) => {
    return (Object.values(equipped) as (Equipment | null)[]).filter(
      (item) => item && item.setName === setName
    ).length;
  };

  const getMaxHp = () => {
    let base = 100 + playerState.tempHpLevel * 15 + playerState.level * 10;
    // Add Race multiplier
    if (activeRace.statsBonus.maxHpPercent) {
      base *= (1 + activeRace.statsBonus.maxHpPercent);
    }
    // Add VIP Blessing
    if (playerState.hasVipStatus) {
      base *= 1.10;
    }
    // Add Equipment maxHp
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item && item.stats.maxHp) {
        base += item.stats.maxHp;
      }
    });
    // Celestial Sunfire 2-Piece: +30% Max HP
    if (getEquippedSetCount("Celestial Sunfire") >= 2) {
      base *= 1.30;
    }
    return Math.floor(base);
  };

  const getStrength = () => {
    let base = 10 + playerState.tempStrengthLevel * 2 + playerState.level * 1.5;
    // Add Race multiplier
    if (activeRace.statsBonus.strengthPercent) {
      base *= (1 + activeRace.statsBonus.strengthPercent);
    }
    // Add VIP Blessing
    if (playerState.hasVipStatus) {
      base *= 1.10;
    }
    // Add Equipment strength
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item && item.stats.strength) {
        base += item.stats.strength;
      }
    });
    // Aetherion's Voidlord 2-Piece: +30% Strength
    if (getEquippedSetCount("Aetherion's Voidlord") >= 2) {
      base *= 1.30;
    }
    return Math.floor(base);
  };

  const getCritRate = () => {
    let base = 0.05 + playerState.tempCritLevel * 0.005; // 5% base + 0.5% per Focus level
    if (activeRace.statsBonus.critRateBonus) {
      base += activeRace.statsBonus.critRateBonus;
    }
    // Add Adrenaline trait (+25% crit if hp is below 40%)
    if (playerState.traitIds.includes("adrenaline") && playerHp / getMaxHp() < 0.40) {
      base += 0.25;
    }
    // Add Equipment critRate
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item && item.stats.critRate) {
        base += item.stats.critRate;
      }
    });
    // Aetherion's Voidlord 2-Piece: +10% Crit Rate
    if (getEquippedSetCount("Aetherion's Voidlord") >= 2) {
      base += 0.10;
    }
    // Celestial Sunfire 4-Piece: Raises crit cap to 95%, otherwise 75%
    const cap = getEquippedSetCount("Celestial Sunfire") >= 4 ? 0.95 : 0.75;
    return Math.min(cap, base);
  };

  const getCritDamageMultiplier = () => {
    let base = 1.5 + playerState.tempCritDmgLevel * 0.05; // 150% base + 5% per Sharp Blades level
    if (activeRace.statsBonus.critDamageBonus) {
      base += activeRace.statsBonus.critDamageBonus;
    }
    // Cosmic Ascension Mythical Trait (+75% Crit Damage)
    if (playerState.traitIds.includes("cosmic_ascension")) {
      base += 0.75;
    }
    // Add Equipment critDamage
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item && item.stats.critDamage) {
        base += item.stats.critDamage;
      }
    });
    // Celestial Sunfire 4-Piece: +250% Crit Damage (+2.5)
    if (getEquippedSetCount("Celestial Sunfire") >= 4) {
      base += 2.50;
    }
    return base;
  };

  const getDodgeChance = () => {
    let base = 0.05 + playerState.tempAgilityLevel * 0.005; // 5% base + 0.5% per level
    if (activeRace.statsBonus.agilityBonus) {
      base += activeRace.statsBonus.agilityBonus;
    }
    // Add Equipment dodge
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item && item.stats.dodge) {
        base += item.stats.dodge;
      }
    });
    // Celestial Sunfire 2-Piece: +15% Dodge
    if (getEquippedSetCount("Celestial Sunfire") >= 2) {
      base += 0.15;
    }
    return Math.min(0.40, base); // Cap dodge at 40%
  };

  // Cooldown speed calculation
  const getAttackCooldownMs = () => {
    let base = 1500; // 1.5 seconds standard
    // Chronos Accelerator permanent upgrade (-4% per level)
    base *= (1 - playerState.permAutoSpeedLevel * 0.04);
    // Time Warp trait (-15% cooldown)
    if (playerState.traitIds.includes("time_warp")) {
      base *= 0.85;
    }
    // Cosmic Ascension trait (-25% cooldown)
    if (playerState.traitIds.includes("cosmic_ascension")) {
      base *= 0.75;
    }
    return Math.max(450, Math.floor(base)); // Cap attack interval speed at 450ms
  };

  // --- Hydrate Save Data ---
  useEffect(() => {
    try {
      const cached = localStorage.getItem("prog_rpg_save_file");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.stats) {
          setPlayerState((prev) => ({ ...prev, ...parsed.stats }));
          // Load other temporary components safely
          if (typeof parsed.raceRolls === "number") setRaceRollsOwned(parsed.raceRolls);
          if (typeof parsed.traitRolls === "number") setTraitRollsOwned(parsed.traitRolls);
          if (parsed.name) setSavedName(parsed.name);
          if (parsed.activeAreaId) setActiveAreaId(parsed.activeAreaId);
          if (parsed.inventory) setInventory(parsed.inventory);
          if (parsed.equipped) setEquipped(parsed.equipped);
          if (parsed.autoSellSettings) setAutoSellSettings(parsed.autoSellSettings);
        }
      }
    } catch (e) {
      console.error("Failed to hydrate save state", e);
    }
  }, []);

  // Update initial Health pool when Max Health recalculates
  useEffect(() => {
    setPlayerHp(getMaxHp());
  }, [playerState.tempHpLevel, playerState.level, playerState.raceId, equipped]);

  // --- Force Save Checkpoint Helper ---
  const handleManualSave = (
    overrideState?: PlayerStats, 
    overrideName?: string,
    overrideInventory?: Equipment[],
    overrideEquipped?: Record<string, Equipment | null>,
    overrideAutoSell?: Record<string, boolean>
  ) => {
    const currentState = overrideState || playerState;
    const currentName = overrideName !== undefined ? overrideName : savedName;
    const currentInventory = overrideInventory !== undefined ? overrideInventory : inventory;
    const currentEquipped = overrideEquipped !== undefined ? overrideEquipped : equipped;
    const currentAutoSell = overrideAutoSell !== undefined ? overrideAutoSell : autoSellSettings;
    const saveObj = {
      stats: currentState,
      raceRolls: raceRollsOwned,
      traitRolls: traitRollsOwned,
      name: currentName,
      activeAreaId: activeAreaId,
      inventory: currentInventory,
      equipped: currentEquipped,
      autoSellSettings: currentAutoSell,
      timestamp: Date.now(),
    };
    localStorage.setItem("prog_rpg_save_file", JSON.stringify(saveObj));
  };

  // Auto save every 10 seconds
  useEffect(() => {
    const saver = setInterval(() => {
      handleManualSave();
    }, 10000);
    return () => clearInterval(saver);
  }, [playerState, raceRollsOwned, traitRollsOwned, savedName, activeAreaId, inventory, equipped, autoSellSettings]);

  // --- Trigger audio safely ---
  const playSfx = (type: "hit" | "crit" | "levelUp" | "dodge" | "prestige" | "defeat") => {
    if (!playerState.soundOn) return;
    if (type === "hit") audio.playHit();
    else if (type === "crit") audio.playCrit();
    else if (type === "levelUp") audio.playLevelUp();
    else if (type === "dodge") audio.playDodge();
    else if (type === "prestige") audio.playPrestige();
    else if (type === "defeat") audio.playDefeat();
  };

  // Natural health regeneration out of combat (+5% per sec) and in combat (+1% per sec)
  useEffect(() => {
    const regen = setInterval(() => {
      if (playerHp >= getMaxHp() || isPlayerDying) return;
      const inCombat = autoBattleActive || isCombatCooldown;
      const rate = inCombat ? 0.015 : 0.06; // 1.5% in combat, 6% out of combat per second
      setPlayerHp((prev) => Math.min(getMaxHp(), prev + Math.floor(getMaxHp() * rate) + 1));
    }, 1000);
    return () => clearInterval(regen);
  }, [playerHp, playerState, autoBattleActive, isCombatCooldown, isPlayerDying]);

  // Handle active enemy change
  const handleSelectEnemy = (enemy: Enemy) => {
    setActiveEnemy(enemy);
    setEnemyHp(enemy.maxHp);
    setIsCombatCooldown(false);
  };

  // Spawns combat popups
  const spawnFloatingText = (text: string, type: "hit" | "crit" | "heal" | "dodge" | "enemy_hit") => {
    const id = Math.random().toString();
    const x = 30 + Math.random() * 40; // Random x percentage between 30% and 70%
    const y = 40 + Math.random() * 20; // Random y percentage
    setFloatingTexts((prev) => [...prev, { id, text, x, y, type }]);

    // Clean up
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 900);
  };

  // Add system combat logs
  const pushCombatLog = (type: CombatLog["type"], message: string) => {
    const id = Math.random().toString();
    setCombatLogs((prev) => [{ id, type, message, timestamp: Date.now() }, ...prev.slice(0, 30)]);
  };

  // --- CORE COMBAT MATH & TRIGGER ---
  const executeAttackTurn = () => {
    if (isCombatCooldown || isPlayerDying || enemyHp <= 0) return;
    
    // Ensure Web Audio context starts on first interaction
    if (!audioInitializedRef.current && playerState.soundOn) {
      audio.startMusic();
      audioInitializedRef.current = true;
    }

    setIsCombatCooldown(true);
    setIsPlayerAttacking(true);
    setTimeout(() => setIsPlayerAttacking(false), 200);

    // 1. Calculate player strike
    const str = getStrength();
    const isCrit = Math.random() < getCritRate();
    const damageMult = 1 + playerState.permDamageMultLevel * 0.15 + (playerState.hasVipStatus ? 0.10 : 0);
    
    let userDmg = Math.floor(str * damageMult);
    // Apply critical hit multiplier
    if (isCrit) {
      userDmg = Math.floor(userDmg * getCritDamageMultiplier());
    }

    // Apply Random Variance (-10% to +10%)
    const variance = (Math.random() * 0.2) - 0.1;
    userDmg = Math.max(1, Math.floor(userDmg * (1 + variance)));

    // Aetherion's Voidlord 4-Piece: Attacks deal +100% Damage (2x damage)
    let isVoidInfused = false;
    if (getEquippedSetCount("Aetherion's Voidlord") >= 4) {
      userDmg *= 2;
      isVoidInfused = true;
    }

    // Handle Double Strike trait trigger
    // Celestial Sunfire 4-Piece: Guaranteed Double Strike on every attack!
    const isSunfireDouble = getEquippedSetCount("Celestial Sunfire") >= 4;
    const hasCosmicAscension = playerState.traitIds.includes("cosmic_ascension");
    const isCosmicDouble = hasCosmicAscension && Math.random() < 0.20; // +20% Double Strike chance
    const hasDoubleStrike = (playerState.traitIds.includes("double_strike") && Math.random() < 0.15) || isCosmicDouble || isSunfireDouble;
    const finalDamage = hasDoubleStrike ? userDmg * 2 : userDmg;

    // Apply HP changes
    const newEnemyHp = Math.max(0, enemyHp - finalDamage);
    setEnemyHp(newEnemyHp);

    if (isCrit) {
      playSfx("crit");
      spawnFloatingText(`CRIT! -${finalDamage.toLocaleString()}`, "crit");
    } else {
      playSfx("hit");
      spawnFloatingText(`-${finalDamage.toLocaleString()}`, "hit");
    }

    let doubleStrikeText = "";
    if (hasDoubleStrike) {
      if (isSunfireDouble) {
        doubleStrikeText = " (Sunfire Flare Double Strike!)";
      } else if (isCosmicDouble) {
        doubleStrikeText = " (Cosmic Double Strike!)";
      } else {
        doubleStrikeText = " (Double Strike!)";
      }
    }
    pushCombatLog(
      isCrit ? "player_crit" : "player_attack",
      `You struck ${activeEnemy.name} dealing ${finalDamage.toLocaleString()} damage${isVoidInfused ? " (Void Infused!)" : ""}${doubleStrikeText}.`
    );

    // Apply Life Steal if active
    if (playerState.traitIds.includes("bloodlust") || hasCosmicAscension) {
      const bsHeal = playerState.traitIds.includes("bloodlust") ? Math.floor(getMaxHp() * 0.05) : 0;
      const caHeal = hasCosmicAscension ? Math.floor(getMaxHp() * 0.10) : 0; // +10% Life Steal
      const healAmt = bsHeal + caHeal;
      setPlayerHp((prev) => Math.min(getMaxHp(), prev + healAmt));
      spawnFloatingText(`+${healAmt.toLocaleString()} HP`, "heal");
    }

    // Aetherion's Voidlord 4-Piece: Heals 10% Max HP every attack in combat!
    if (isVoidInfused) {
      const voidHeal = Math.floor(getMaxHp() * 0.10);
      setPlayerHp((prev) => Math.min(getMaxHp(), prev + voidHeal));
      spawnFloatingText(`+${voidHeal.toLocaleString()} Void Heal`, "heal");
    }

    // Check if enemy died
    if (newEnemyHp <= 0) {
      handleEnemyDefeat();
      return;
    }

    // 2. Enemy Counterattack
    setTimeout(() => {
      if (isPlayerDying || newEnemyHp <= 0) {
        setIsCombatCooldown(false);
        return;
      }

      setIsEnemyAttacking(true);
      setTimeout(() => setIsEnemyAttacking(false), 200);

      const dodgeCheck = Math.random() < getDodgeChance();

      if (dodgeCheck) {
        playSfx("dodge");
        spawnFloatingText("DODGED!", "dodge");
        pushCombatLog("player_dodge", `You dodged ${activeEnemy.name}'s attack counter!`);
        setIsCombatCooldown(false);
      } else {
        // Enemy damage variance
        const enemyDmgVariance = (Math.random() * 0.2) - 0.1;
        const enemyBaseDmg = activeEnemy.isBoss ? activeEnemy.damage * 1.3 : activeEnemy.damage;
        const finalEnemyDmg = Math.max(1, Math.floor(enemyBaseDmg * (1 + enemyDmgVariance)));

        const newPlayerHp = Math.max(0, playerHp - finalEnemyDmg);
        setPlayerHp(newPlayerHp);
        spawnFloatingText(`-${finalEnemyDmg}`, "enemy_hit");
        playSfx("hit");

        pushCombatLog("enemy_attack", `${activeEnemy.name} strikes you back for ${finalEnemyDmg.toLocaleString()} damage.`);

        // Check player death
        if (newPlayerHp <= 0) {
          handlePlayerDefeat();
        } else {
          setIsCombatCooldown(false);
        }
      }
    }, 250);
  };

  const handleLootItem = (lootedItem: Equipment) => {
    const shouldAutoSell = autoSellSettings[lootedItem.rarity];
    if (shouldAutoSell) {
      const autoGold = lootedItem.sellValue;
      setPlayerState((prev) => ({ ...prev, coins: prev.coins + autoGold }));
      pushCombatLog("victory", `🪙 Auto-sold [${lootedItem.name}] (${lootedItem.rarity}) instantly for ${autoGold} coins.`);
    } else {
      setInventory((prevInv) => {
        if (prevInv.length >= 50) {
          const autoGold = lootedItem.sellValue;
          setPlayerState((prev) => ({ ...prev, coins: prev.coins + autoGold }));
          pushCombatLog("victory", `🎒 Bag Full! Auto-sold [${lootedItem.name}] for ${autoGold} 🪙`);
          return prevInv;
        } else {
          pushCombatLog("victory", `🎁 Looted: [${lootedItem.name}] (${lootedItem.rarity})! Check 🎒 Gear tab!`);
          const nextInv = [...prevInv, lootedItem];
          setTimeout(() => handleManualSave(undefined, undefined, nextInv, undefined), 50);
          return nextInv;
        }
      });
    }
  };

  // Handle enemy defeat and reward distribution
  const handleEnemyDefeat = () => {
    playSfx("levelUp");
    pushCombatLog("victory", `Vanquished ${activeEnemy.name}! Earned rewards.`);

    // Calculations for rewards
    let gearCoinMult = 0;
    let gearExpMult = 0;
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (item) {
        if (item.stats.coinMult) gearCoinMult += item.stats.coinMult;
        if (item.stats.expMult) gearExpMult += item.stats.expMult;
      }
    });

    const coinMult = 1 + playerState.permCoinMultLevel * 0.10 + 
                     (activeRace.statsBonus.coinMultiplierBonus || 0) + 
                     (playerState.hasCoinBoost ? 0.50 : 0) + 
                     (playerState.hasVipStatus ? 0.10 : 0) +
                     gearCoinMult;
    
    // Gold Digger trait (+1% coins per 10 levels)
    let goldDiggerBonus = 0;
    if (playerState.traitIds.includes("gold_digger")) {
      goldDiggerBonus = (playerState.level / 10) * 0.01;
    }

    const baseCoins = activeEnemy.coinReward;
    const coinsLooted = Math.floor(baseCoins * (coinMult + goldDiggerBonus));

    const expMult = 1 + playerState.permExpMultLevel * 0.10 + 
                    (activeRace.statsBonus.expMultiplierBonus || 0) + 
                    (playerState.hasXpBoost ? 0.50 : 0) + 
                    (playerState.hasVipStatus ? 0.10 : 0) +
                    gearExpMult;
    const baseExp = activeEnemy.expReward;
    const expGained = Math.floor(baseExp * expMult);

    // Gems reward (Bosses have a 100% chance to drop 1-3 gems)
    let gemsEarned = 0;
    if (activeEnemy.isBoss) {
      gemsEarned = Math.floor(Math.random() * 3) + 1;
    }

    // Apply rewards to state
    setPlayerState((prev) => {
      let nextExp = prev.exp + expGained;
      let nextLvl = prev.level;
      let leveledUp = false;

      // Check level up sequence
      while (nextExp >= getExpNeededForNextLevel(nextLvl)) {
        nextExp -= getExpNeededForNextLevel(nextLvl);
        nextLvl += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        setTimeout(() => {
          playSfx("levelUp");
          spawnFloatingText("LEVEL UP!", "heal");
          pushCombatLog("level_up", `🎉 Congratulations! You ascended to Level ${nextLvl}!`);
        }, 100);
      }

      return {
        ...prev,
        coins: prev.coins + coinsLooted,
        exp: nextExp,
        level: nextLvl,
        gems: prev.gems + gemsEarned,
      };
    });

    // Randomized Equipment Drop Check (35% for normal enemies, 100% for bosses)
    const isDrop = activeEnemy.isBoss || Math.random() < 0.35;
    if (isDrop) {
      const lootedItem = generateLootItem(activeEnemy.level);
      handleLootItem(lootedItem);
    }

    // Respawn target immediately
    setTimeout(() => {
      setEnemyHp(activeEnemy.maxHp);
      setIsCombatCooldown(false);
    }, 150);
  };

  // Handle Player defeat sequence
  const handlePlayerDefeat = () => {
    setIsPlayerDying(true);
    setAutoBattleActive(false);
    playSfx("defeat");
    pushCombatLog("defeat", "💀 You were defeated! Reviving at checkpoint...");

    setTimeout(() => {
      setPlayerHp(getMaxHp());
      setEnemyHp(activeEnemy.maxHp);
      setIsPlayerDying(false);
      setIsCombatCooldown(false);
    }, 2000); // 2 seconds revive block
  };

  // --- INVENTORY MANAGEMENT HANDLERS ---
  const handleEquipItem = (item: Equipment) => {
    const slot = item.slot;
    const previouslyEquipped = equipped[slot];

    setEquipped((prev) => {
      const nextEquipped = { ...prev, [slot]: item };
      
      setInventory((prevInv) => {
        // Remove item from inventory
        let nextInv = prevInv.filter((i) => i.id !== item.id);
        // Put old item back in inventory
        if (previouslyEquipped) {
          nextInv = [...nextInv, previouslyEquipped];
        }
        
        pushCombatLog("level_up", `🛡️ Equipped [${item.name}] (+${item.level}) into ${slot.toUpperCase()}!`);
        setTimeout(() => handleManualSave(undefined, undefined, nextInv, nextEquipped), 50);
        return nextInv;
      });

      return nextEquipped;
    });
  };

  const handleUnequipItem = (slot: string) => {
    const item = equipped[slot];
    if (!item) return;

    if (inventory.length >= 50) {
      pushCombatLog("defeat", "🎒 Cannot unequip! Inventory bag is fully packed.");
      return;
    }

    setEquipped((prev) => {
      const nextEquipped = { ...prev, [slot]: null };
      
      setInventory((prevInv) => {
        const nextInv = [...prevInv, item];
        pushCombatLog("victory", `❌ Unequipped [${item.name}] back to inventory.`);
        setTimeout(() => handleManualSave(undefined, undefined, nextInv, nextEquipped), 50);
        return nextInv;
      });

      return nextEquipped;
    });
  };

  const handleUpgradeItem = (item: Equipment) => {
    if (playerState.coins < item.upgradeCost) return;

    // Deduct cost
    setPlayerState((prev) => ({ ...prev, coins: prev.coins - item.upgradeCost }));

    const upgradeStats = (stats: Equipment["stats"]) => {
      const nextStats = { ...stats };
      if (nextStats.strength) nextStats.strength = Math.round(nextStats.strength * 1.25);
      if (nextStats.maxHp) nextStats.maxHp = Math.round(nextStats.maxHp * 1.25);
      if (nextStats.critRate) nextStats.critRate = parseFloat((nextStats.critRate + 0.002).toFixed(3));
      if (nextStats.critDamage) nextStats.critDamage = parseFloat((nextStats.critDamage + 0.01).toFixed(3));
      if (nextStats.dodge) nextStats.dodge = parseFloat((nextStats.dodge + 0.001).toFixed(3));
      if (nextStats.coinMult) nextStats.coinMult = parseFloat((nextStats.coinMult + 0.005).toFixed(3));
      if (nextStats.expMult) nextStats.expMult = parseFloat((nextStats.expMult + 0.005).toFixed(3));
      return nextStats;
    };

    const upgradeItemObj = (target: Equipment): Equipment => ({
      ...target,
      level: target.level + 1,
      stats: upgradeStats(target.stats),
      sellValue: Math.round(target.sellValue * 1.2),
      upgradeCost: Math.round(target.upgradeCost * 1.35),
    });

    // Check if item is equipped or in inventory
    const isEquipped = equipped[item.slot]?.id === item.id;

    if (isEquipped) {
      setEquipped((prev) => {
        const nextEquipped = { ...prev, [item.slot]: upgradeItemObj(prev[item.slot]!) };
        pushCombatLog("level_up", `⚡ Success! Upgraded [${item.name}] to +${item.level + 1}!`);
        setTimeout(() => handleManualSave(undefined, undefined, undefined, nextEquipped), 50);
        return nextEquipped;
      });
    } else {
      setInventory((prevInv) => {
        const nextInv = prevInv.map((i) => (i.id === item.id ? upgradeItemObj(i) : i));
        pushCombatLog("level_up", `⚡ Success! Upgraded [${item.name}] to +${item.level + 1}!`);
        setTimeout(() => handleManualSave(undefined, undefined, nextInv, undefined), 50);
        return nextInv;
      });
    }
  };

  const handleSellItem = (item: Equipment) => {
    setPlayerState((prev) => ({ ...prev, coins: prev.coins + item.sellValue }));
    pushCombatLog("victory", `🪙 Sold [${item.name}] for ${item.sellValue} coins.`);

    const isEquipped = equipped[item.slot]?.id === item.id;

    if (isEquipped) {
      setEquipped((prev) => {
        const nextEquipped = { ...prev, [item.slot]: null };
        setTimeout(() => handleManualSave(undefined, undefined, undefined, nextEquipped), 50);
        return nextEquipped;
      });
    } else {
      setInventory((prevInv) => {
        const nextInv = prevInv.filter((i) => i.id !== item.id);
        setTimeout(() => handleManualSave(undefined, undefined, nextInv, undefined), 50);
        return nextInv;
      });
    }
  };

  const handleSellAllCommons = () => {
    const commonItems = inventory.filter((i) => i.rarity === Rarity.COMMON);
    if (commonItems.length === 0) return;

    const totalRevenue = commonItems.reduce((sum, item) => sum + item.sellValue, 0);

    setPlayerState((prev) => ({ ...prev, coins: prev.coins + totalRevenue }));
    setInventory((prevInv) => {
      const nextInv = prevInv.filter((i) => i.rarity !== Rarity.COMMON);
      pushCombatLog("victory", `🪙 Bulk-sold ${commonItems.length} common items for ${totalRevenue} coins!`);
      setTimeout(() => handleManualSave(undefined, undefined, nextInv, undefined), 50);
      return nextInv;
    });
  };

  const handleSellMultipleItems = (itemsToSell: Equipment[]) => {
    if (itemsToSell.length === 0) return;
    const totalRevenue = itemsToSell.reduce((sum, item) => sum + item.sellValue, 0);

    setPlayerState((prev) => ({ ...prev, coins: prev.coins + totalRevenue }));
    
    const idsToSell = new Set(itemsToSell.map(i => i.id));
    
    setInventory((prevInv) => {
      const nextInv = prevInv.filter((i) => !idsToSell.has(i.id));
      pushCombatLog("victory", `🪙 Bulk-sold ${itemsToSell.length} item(s) for ${totalRevenue} coins!`);
      setTimeout(() => handleManualSave(undefined, undefined, nextInv, undefined), 50);
      return nextInv;
    });
  };

  const handleUpdateAutoSellSettings = (settings: Record<string, boolean>) => {
    setAutoSellSettings(settings);
    setTimeout(() => handleManualSave(undefined, undefined, undefined, undefined, settings), 50);
  };

  // --- AUTOMATIC FIGHTS LOOP ---
  useEffect(() => {
    if (!autoBattleActive || isCombatCooldown || isPlayerDying || enemyHp <= 0) return;
    
    // Loop interval
    const loop = setTimeout(() => {
      executeAttackTurn();
    }, getAttackCooldownMs());

    return () => clearTimeout(loop);
  }, [autoBattleActive, isCombatCooldown, isPlayerDying, enemyHp]);

  // --- PRESTIGE RESET LOGIC ---
  const handlePerformPrestige = () => {
    if (playerState.level < 50) return;

    playSfx("prestige");
    setPrestigeAnimate(true);
    setAutoBattleActive(false);

    setTimeout(() => {
      setPlayerState((prev) => {
        const nextPrestige = prev.prestige + 1;
        
        // Multipliers from Prestige
        const rollsMultiplier = prev.hasPrestigeEnhancement ? 1.2 : 1.0;
        const raceRollsGranted = Math.max(2, Math.floor(3 * rollsMultiplier));
        const traitRollsGranted = Math.max(1, Math.floor(2 * rollsMultiplier));
        
        // Roll tokens increment
        setRaceRollsOwned((r) => r + raceRollsGranted);
        setTraitRollsOwned((t) => t + traitRollsGranted);

        // Rebuild temporary reset variables
        return {
          ...prev,
          level: 1,
          exp: 0,
          coins: 100, // starting cash boost
          prestige: nextPrestige,
          gems: prev.gems + 50,
          // Reset temporary training
          tempStrengthLevel: 0,
          tempHpLevel: 0,
          tempAgilityLevel: 0,
          tempCritLevel: 0,
          tempCritDmgLevel: 0,
        };
      });

      // Revive HP pools
      setPlayerHp(110); // Base level 1 HP
      setEnemyHp(activeEnemy.maxHp);
      
      setPrestigeAnimate(false);
      setActiveTab("gacha"); // Route to rolled rewards page so they spend rolls!
      pushCombatLog("level_up", "✨ Magnificence! You prestiged into cosmic infinity!");
    }, 3500); // 3.5s dramatic portal cinematic
  };

  // --- UPGRADE BUY HANDLERS ---
  const handleBuyTempUpgrade = (type: "strength" | "hp" | "agility" | "crit" | "critDmg", cost: number) => {
    if (playerState.coins < cost) return;
    
    setPlayerState((prev) => {
      const updated = { ...prev, coins: prev.coins - cost };
      if (type === "strength") updated.tempStrengthLevel += 1;
      else if (type === "hp") updated.tempHpLevel += 1;
      else if (type === "agility") updated.tempAgilityLevel += 1;
      else if (type === "crit") updated.tempCritLevel += 1;
      else if (type === "critDmg") updated.tempCritDmgLevel += 1;
      return updated;
    });
    playSfx("hit");
  };

  const handleBuyPermUpgrade = (type: "coinMult" | "expMult" | "damageMult" | "autoSpeed", cost: number) => {
    if (playerState.coins < cost) return;

    setPlayerState((prev) => {
      const updated = { ...prev, coins: prev.coins - cost };
      if (type === "coinMult") updated.permCoinMultLevel += 1;
      else if (type === "expMult") updated.permExpMultLevel += 1;
      else if (type === "damageMult") updated.permDamageMultLevel += 1;
      else if (type === "autoSpeed") updated.permAutoSpeedLevel += 1;
      return updated;
    });
    playSfx("levelUp");
  };

  const handleBuyPremium = (itemType: "xpBoost" | "coinBoost" | "autoBattle" | "prestigeEnhance" | "vipStatus", cost: number) => {
    if (playerState.gems < cost) return;

    setPlayerState((prev) => {
      const updated = { ...prev, gems: prev.gems - cost };
      if (itemType === "xpBoost") updated.hasXpBoost = true;
      else if (itemType === "coinBoost") updated.hasCoinBoost = true;
      else if (itemType === "autoBattle") updated.hasAutoBattleUnlocked = true;
      else if (itemType === "prestigeEnhance") updated.hasPrestigeEnhancement = true;
      else if (itemType === "vipStatus") updated.hasVipStatus = true;
      return updated;
    });
    playSfx("prestige");
  };

  const handleBuyRolls = (type: "race" | "trait", count: number, cost: number) => {
    if (playerState.gems < cost) return;

    setPlayerState((prev) => ({ ...prev, gems: Math.max(0, prev.gems - cost) }));
    if (type === "race") {
      setRaceRollsOwned((r) => r + count);
    } else if (type === "trait") {
      setTraitRollsOwned((t) => t + count);
    }
    playSfx("prestige");
  };

  const handleGrantGems = (amt: number) => {
    setPlayerState((prev) => ({ ...prev, gems: prev.gems + amt }));
  };

  // --- SAVE BACKUP PORT PORTER ---
  const handleImportState = (importedStats: Partial<PlayerStats>, importName: string) => {
    setPlayerState((prev) => ({ ...prev, ...importedStats }));
    if (importName) setSavedName(importName);
    // Explicit manual save trigger to overwrite cache
    setTimeout(() => handleManualSave({ ...playerState, ...importedStats }, importName), 200);
  };

  const handleHardReset = () => {
    localStorage.removeItem("prog_rpg_save_file");
    setPlayerState(createInitialPlayerState());
    setSavedName("");
    setRaceRollsOwned(3);
    setTraitRollsOwned(0);
    setActiveAreaId("woods");
    setActiveEnemy(GAME_AREAS[0].enemies[0]);
    setEnemyHp(GAME_AREAS[0].enemies[0].maxHp);
    setAutoBattleActive(false);
  };

  const handleProfileSubmit = (name: string) => {
    setSavedName(name);
    handleManualSave(playerState, name);
  };

  // Check if auto battle can be toggled
  const isAutoBattleAllowed = playerState.level >= 15 || playerState.hasAutoBattleUnlocked || playerState.prestige > 0;

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-[#050507] game-container-bg text-[#e2e8f0] flex flex-col font-sans select-none relative overflow-x-hidden antialiased selection:bg-indigo-500 selection:text-white" id="game-app-shell">
      
      {/* PRESTIGE TRANSCENDENCE CINEMATIC OVERLAY */}
      <AnimatePresence>
        {prestigeAnimate && (
          <motion.div
            id="prestige-portal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.3, rotate: 0 }}
              animate={{ scale: [0.3, 1.8, 1.2], rotate: 360 }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="h-44 w-44 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 blur-xl opacity-80 absolute"
            />
            <div className="relative space-y-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Crown size={64} className="mx-auto text-amber-400 animate-bounce" />
              </motion.div>
              <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-3xl font-black uppercase tracking-widest bg-gradient-to-r from-amber-200 via-indigo-300 to-rose-300 bg-clip-text text-transparent font-mono"
              >
                Transcending Eternity
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="text-slate-400 text-sm max-w-sm font-mono mx-auto leading-relaxed"
              >
                Your mortal level resets. In exchange, the cosmos crowns you with permanent power, rare roll multipliers, and legendary roll tokens...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="panel-glass shrink-0 sticky top-0 z-40 m-3 mb-0 lg:m-3.5 lg:mb-0" id="game-header">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo and Level details */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl shadow-lg border border-indigo-500/20 shrink-0">
              <Swords size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white font-mono uppercase">Infinite RPG Quest</span>
                {playerState.prestige > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-gradient-to-r from-indigo-500 to-purple-600 border border-indigo-400 text-white rounded font-black font-mono">
                    P-{playerState.prestige}
                  </span>
                )}
                {playerState.hasVipStatus && (
                  <span className="text-amber-400" title="VIP Status Active"><Crown size={14} className="fill-amber-400" /></span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                <span>Lv. <strong className="text-slate-100">{playerState.level}</strong></span>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1">
                  <span>EXP:</span>
                  <div className="w-24 bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                    <div
                      className="xp-bar-fill h-full transition-all duration-300"
                      style={{ width: `${(playerState.exp / expNeeded) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {Math.round((playerState.exp / expNeeded) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current balance currencies */}
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Coins */}
            <div className="flex items-center gap-1.5 font-mono text-sm bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl text-amber-400" title="Gold Coins used for local and structural training upgrades.">
              <span>🪙</span>
              <span className="font-bold">{playerState.coins.toLocaleString()}</span>
            </div>

            {/* Gems */}
            <div className="flex items-center gap-1.5 font-mono text-sm bg-slate-950/40 border border-white/5 px-3 py-1.5 rounded-xl text-indigo-400" title="Premium Gems used for boosters. Earned from bosses and cooperative raids.">
              <span>💎</span>
              <span className="font-bold">{playerState.gems.toLocaleString()}</span>
            </div>

            {/* Sound setup & volume channel overlay */}
            <AudioControls
              musicVolume={playerState.musicVolume}
              sfxVolume={playerState.sfxVolume}
              soundOn={playerState.soundOn}
              onVolumeChange={(music, sfx, enabled) => {
                setPlayerState((prev) => ({
                  ...prev,
                  musicVolume: music,
                  sfxVolume: sfx,
                  soundOn: enabled,
                }));
              }}
            />
          </div>

        </div>
      </header>

      {/* MAIN GAME CONTAINER: Split layouts */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 overflow-y-auto lg:overflow-hidden min-h-0" id="game-main-stage">
        
        {/* LEFT COLUMN: Fighting Arena Panel (5 columns) */}
        <section className="lg:col-span-5 flex flex-col gap-3 sm:gap-4 lg:h-full lg:min-h-0" id="left-battle-arena-section">
          
          <div className="panel-glass p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4 relative overflow-hidden shadow-xl lg:min-h-0" id="combat-arena-container">
            
            {/* Ambient arena background graphics */}
            <div className="absolute inset-0 bg-radial-gradient from-slate-900 via-transparent to-transparent opacity-40 pointer-events-none" />

            {/* Area and Cooldown stats */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                🏕️ Active Zone: {activeArea.name}
              </span>
              {autoBattleActive && (
                <span className="px-2 py-0.5 text-[9px] bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono font-bold rounded animate-pulse">
                  AUTO BATTLE ACTIVE
                </span>
              )}
            </div>

            {/* BATTLEGROUND SCREEN: Models of Monster & Player */}
            <div className="relative flex-1 min-h-[180px] lg:min-h-[200px] max-h-[260px] w-full flex flex-col justify-between items-center py-3 bg-slate-950/40 border border-white/5 rounded-2xl" id="battleground-graphics-box">
              
              {/* Floating numbers layer */}
              <FloatingCombatText items={floatingTexts} />

              {/* Monster Model representation */}
              <motion.div
                id="monster-model-container"
                animate={isEnemyAttacking ? { y: 25, scale: 1.05 } : isPlayerAttacking ? { scale: 0.95, y: -5 } : { y: 0 }}
                transition={{ duration: 0.15 }}
                className={`text-center space-y-2 select-none ${
                  enemyHp <= 0 ? "opacity-30 blur-[1px]" : ""
                }`}
              >
                <div className="relative">
                  <div className={`mx-auto h-20 w-20 rounded-full border bg-gradient-to-b flex items-center justify-center overflow-hidden text-4xl shadow-md ${
                    activeEnemy.isBoss
                      ? "from-rose-950 to-slate-900 border-rose-500 shadow-rose-500/10"
                      : "from-slate-900 to-slate-950 border-slate-800"
                  }`}>
                    {activeEnemy.imageUrl ? (
                      <img
                        src={activeEnemy.imageUrl}
                        alt={activeEnemy.name}
                        className="w-full h-full object-cover animate-fade-in"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      activeEnemy.isBoss ? "👹" : "👾"
                    )}
                  </div>
                  {activeEnemy.isBoss && (
                    <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 bg-rose-600 text-white rounded text-[8px] font-black font-mono tracking-widest uppercase">
                      BOSS
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-black tracking-tight text-slate-200">
                    {activeEnemy.name} <span className="text-slate-500 font-mono text-[10px]">Lv.{activeEnemy.level}</span>
                  </h3>
                  
                  {/* Monster HP progress bar */}
                  <div className="w-48 space-y-0.5 mx-auto">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5 relative">
                      <div
                        className="health-bar-fill h-full transition-all duration-200"
                        style={{ width: `${(enemyHp / activeEnemy.maxHp) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>HP:</span>
                      <span>{enemyHp.toLocaleString()} / {activeEnemy.maxHp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Central vs partition marker */}
              <div className="h-0.5 w-full border-t border-white/5 relative">
                <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0d0d11] border border-white/5 text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded-full">
                  VS
                </span>
              </div>

              {/* Player Model representation */}
              <motion.div
                id="player-model-container"
                animate={isPlayerAttacking ? { y: -25, scale: 1.05 } : isEnemyAttacking ? { scale: 0.95 } : { y: 0 }}
                transition={{ duration: 0.15 }}
                className="text-center space-y-2 select-none"
              >
                <div className="space-y-1">
                  {/* Player HP progress bar */}
                  <div className="w-48 space-y-0.5 mx-auto">
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5 relative">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] h-full transition-all duration-200"
                        style={{ width: `${(playerHp / getMaxHp()) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-slate-500">
                      <span>My HP:</span>
                      <span className="text-slate-300 font-bold">{playerHp.toLocaleString()} / {getMaxHp().toLocaleString()}</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-300">
                    {savedName || "Mortal Hero"} <span className="text-indigo-400 font-mono text-[9px]">({activeRace.name})</span>
                  </h3>
                </div>
              </motion.div>

            </div>

            {/* CONTROLS ZONE: Attack triggers & Auto toggler */}
            <div className="space-y-3 z-10" id="battleground-controls-zone">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <button
                  id="btn-active-strike"
                  onClick={executeAttackTurn}
                  disabled={isCombatCooldown || isPlayerDying || enemyHp <= 0}
                  className={`py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                    isCombatCooldown || isPlayerDying || enemyHp <= 0
                      ? "bg-slate-850 text-slate-500 cursor-not-allowed border border-white/5"
                      : "bg-red-600 hover:bg-red-500 text-white cursor-pointer border border-red-400/40 shadow-lg shadow-red-950/30"
                  }`}
                >
                  <Swords size={14} />
                  <span>Manual Attack</span>
                </button>

                {/* Auto combat lock check */}
                {isAutoBattleAllowed ? (
                  <button
                    id="btn-toggle-autobattle"
                    onClick={() => {
                      setAutoBattleActive(!autoBattleActive);
                      pushCombatLog("level_up", autoBattleActive ? "Auto Battle paused." : "Auto Battle engaged!");
                    }}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      autoBattleActive
                        ? "btn-active border-indigo-500/40 font-black uppercase tracking-wider"
                        : "bg-[#0f0f15]/80 border-white/5 hover:bg-white/5 text-slate-300 font-bold uppercase tracking-wider"
                    }`}
                  >
                    {autoBattleActive ? (
                      <>
                        <Square size={13} className="fill-blue-400 text-blue-400" />
                        <span>Auto-Battle Active</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="fill-slate-300 text-slate-300" />
                        <span>Engage Auto-Battle</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div
                    id="autobattle-locked-overlay"
                    className="py-3 rounded-xl bg-slate-950/60 border border-white/5 text-center text-slate-500 text-[10px] font-mono leading-tight flex flex-col justify-center px-2 cursor-help"
                    title="Unlock Auto Battle by reaching Character Level 15, completing your first prestige reset, or purchasing Convenience unlocks in the Premium shop!"
                  >
                    <span>🔒 AUTO BATTLE LOCKED</span>
                    <span className="text-[8px] text-slate-600 mt-0.5">Unlocks at Level 15 or Prestige P-1+</span>
                  </div>
                )}

              </div>

              {/* Prestige Reset Panel (Always visible for clarity and sandbox tests) */}
              <div
                id="prestige-reset-box"
                className={`p-3 border rounded-xl flex flex-col justify-between items-center text-center gap-2 animate-in fade-in duration-200 ${
                  playerState.level >= 50
                    ? "bg-indigo-950/10 border-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "bg-slate-950/40 border-white/5 text-slate-500"
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold block text-white flex items-center gap-1 justify-center">
                    <Crown size={13} className={playerState.level >= 50 ? "text-amber-400" : "text-slate-500"} />
                    Prestige Ascension Protocol
                  </span>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Requirement: Level 50. Progress: (<strong className={playerState.level >= 50 ? "text-emerald-400" : "text-amber-400"}>{playerState.level}</strong>/50). Wipes level progress for permanent race multipliers and rolls.
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-center w-full">
                  <button
                    id="btn-prestige-ascend"
                    onClick={handlePerformPrestige}
                    disabled={playerState.level < 50}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                      playerState.level >= 50
                        ? "bg-indigo-600 border border-indigo-400 text-white cursor-pointer hover:bg-indigo-500 font-black tracking-wider uppercase"
                        : "bg-slate-800/60 text-slate-600 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <Crown size={12} /> Ascend Prestige Rank
                  </button>
                  {playerState.level < 50 && (
                    <button
                      id="btn-prestige-cheat-level"
                      onClick={() => {
                        setPlayerState((prev) => ({ ...prev, level: 50 }));
                        pushCombatLog("level_up", "✨ Sandbox Mode: Level boosted to 50! Open the Prestige tab or click Ascend to transcend!");
                      }}
                      className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                      title="Instantly set level to 50 for quick testing"
                    >
                      ⚡ Get Lv.50
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* COMBAT TICKER LOGS INBOX */}
          <div className="panel-glass p-3 sm:p-4 flex flex-col h-[150px] lg:h-[160px] shrink-0" id="logs-inbox-section">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2 block border-b border-white/5 pb-1.5 flex items-center gap-1">
              <Compass size={12} /> Fight Adventure Logs
            </span>
            <div
              id="combat-adventure-logs"
              className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] text-slate-400 scrollbar-none"
            >
              {combatLogs.length === 0 ? (
                <div className="text-slate-600 italic text-center py-10">Select an enemy and strike to launch logging feeds!</div>
              ) : (
                combatLogs.map((log) => {
                  let logColor = "text-slate-400";
                  if (log.type === "victory") logColor = "text-emerald-400 font-bold";
                  else if (log.type === "defeat") logColor = "text-rose-400 font-bold";
                  else if (log.type === "player_crit") logColor = "text-indigo-400 font-bold";
                  else if (log.type === "level_up") logColor = "text-cyan-300 font-bold";
                  else if (log.type === "player_dodge") logColor = "text-cyan-400";

                  return (
                    <div key={log.id} className="leading-relaxed border-b border-white/5 pb-1 flex items-start gap-1">
                      <span className="text-slate-600 select-none">&rsaquo;</span>
                      <span className={logColor}>[SYSTEM] {log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: Tabbed Navigation & Dashboard Details (7 columns) */}
        <section className="lg:col-span-7 flex flex-col gap-3 sm:gap-4 lg:h-full lg:min-h-0" id="right-tabbed-dashboard-section">
          
          {/* TAB BUTTONS LIST */}
          <div
            id="tab-buttons-container"
            className="flex flex-wrap items-center panel-glass p-1.5 gap-1 shrink-0 overflow-x-auto"
          >
            {[
              { id: "combat", label: "🗺️ Adventure", icon: Compass },
              { id: "inventory", label: "🎒 Gear", icon: Shield },
              { id: "upgrades", label: "🪙 Upgrades", icon: Coins },
              { id: "prestige", label: "👑 Prestige", icon: Crown },
              { id: "gacha", label: "🎰 Identity", icon: Sparkles },
              { id: "raid", label: "🔥 Raid Boss", icon: Flame },
              { id: "multiplayer", label: "🏆 Lobby", icon: Users },
              { id: "premium", label: "💎 Premium", icon: Gem },
              { id: "saves", label: "💾 Saves", icon: RefreshCw },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-trigger-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                    isActive
                      ? "btn-active"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE PANEL CONTENT DISPLAY */}
          <div className="flex-1 lg:min-h-0 lg:overflow-y-auto pr-1" id="active-tab-panel-container">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {/* 1. AREAS & STATS COLUMN */}
                {activeTab === "combat" && (
                  <div className="space-y-4" id="view-areas-combat">
                    {/* Character Stats sheet (Bento look) */}
                    <div className="panel-glass p-4 space-y-3">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block border-b border-white/5 pb-1.5">
                        🛡️ Combat Statistics
                      </span>
                      <div className="flex flex-col gap-1">
                        <div className="stat-row">
                          <span className="stat-label">Health</span>
                          <span className="stat-value text-rose-400">{getMaxHp().toLocaleString()}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Strength</span>
                          <span className="stat-value">{getStrength().toLocaleString()}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Critical Rate</span>
                          <span className="stat-value">{(getCritRate() * 100).toFixed(1)}%</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Crit Damage</span>
                          <span className="stat-value">{Math.round(getCritDamageMultiplier() * 100)}%</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Dodge Chance</span>
                          <span className="stat-value">{(getDodgeChance() * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Area exploration panels */}
                    <div className="panel-glass p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                          <Compass size={16} />
                          Adventure Regions
                        </h3>
                        <p className="text-xs text-slate-500">Travel to harder regions. Earn progressively greater rewards.</p>
                      </div>

                      <div className="space-y-4">
                        {GAME_AREAS.map((area: GameArea) => {
                          const isUnlocked = playerState.level >= area.minLevel || playerState.prestige > 0;
                          const isCurrent = activeAreaId === area.id;

                          return (
                            <div
                              key={area.id}
                              className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                isCurrent
                                  ? "bg-indigo-500/10 border-indigo-500/30"
                                  : isUnlocked
                                  ? "bg-white/5 border-white/5 hover:border-white/10"
                                  : "bg-slate-950/10 border-slate-900 opacity-50"
                              }`}
                              id={`area-block-${area.id}`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black uppercase tracking-wider text-slate-100">{area.name}</span>
                                  {!isUnlocked && (
                                    <span className="px-1.5 py-0.5 text-[8px] bg-slate-800 text-slate-500 rounded font-bold font-mono">
                                      LOCKED: LV.{area.minLevel}
                                    </span>
                                  )}
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.5 text-[8px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 rounded font-bold font-mono uppercase tracking-wider">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400 max-w-md leading-relaxed">{area.description}</p>
                              </div>

                              {isUnlocked ? (
                                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                  {/* Select specific monsters inside the area */}
                                  {area.enemies.map((enemy) => {
                                    const isTargeted = activeEnemy.id === enemy.id;
                                    return (
                                      <button
                                        key={enemy.id}
                                        id={`btn-target-enemy-${enemy.id}`}
                                        onClick={() => {
                                          setActiveAreaId(area.id);
                                          handleSelectEnemy(enemy);
                                        }}
                                        className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all border flex items-center gap-1.5 ${
                                          isTargeted
                                            ? "btn-active border-indigo-400 font-bold shadow-md text-[10px] uppercase tracking-wider"
                                            : "bg-slate-900 hover:bg-slate-800 border-white/5 text-slate-300 font-bold text-[10px] uppercase tracking-wider"
                                        }`}
                                      >
                                        {enemy.isBoss && enemy.imageUrl && (
                                          <img
                                            src={enemy.imageUrl}
                                            alt={enemy.name}
                                            className="w-4 h-4 rounded-full object-cover border border-rose-500/50 shrink-0"
                                            referrerPolicy="no-referrer"
                                          />
                                        )}
                                        {enemy.isBoss ? "👹 Boss" : enemy.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                                  <span>🔒 Lock active. Ascend level.</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. UPGRADES SHOP PANEL */}
                {activeTab === "upgrades" && (
                  <UpgradesShop
                    coins={playerState.coins}
                    tempStrengthLevel={playerState.tempStrengthLevel}
                    tempHpLevel={playerState.tempHpLevel}
                    tempAgilityLevel={playerState.tempAgilityLevel}
                    tempCritLevel={playerState.tempCritLevel}
                    tempCritDmgLevel={playerState.tempCritDmgLevel}
                    permCoinMultLevel={playerState.permCoinMultLevel}
                    permExpMultLevel={playerState.permExpMultLevel}
                    permDamageMultLevel={playerState.permDamageMultLevel}
                    permAutoSpeedLevel={playerState.permAutoSpeedLevel}
                    onBuyTempUpgrade={handleBuyTempUpgrade}
                    onBuyPermUpgrade={handleBuyPermUpgrade}
                  />
                )}

                {/* 3. GACHA SYSTEM PANEL */}
                {activeTab === "gacha" && (
                  <CharacterGacha
                    playerRaceId={playerState.raceId}
                    playerTraitIds={playerState.traitIds}
                    playerPrestige={playerState.prestige}
                    raceRollsOwned={raceRollsOwned}
                    traitRollsOwned={traitRollsOwned}
                    onSetRace={(rId) => setPlayerState((prev) => ({ ...prev, raceId: rId }))}
                    onAddOrReplaceTrait={(trId) => {
                      setPlayerState((prev) => {
                        // Max 3 active traits. If exceeds, replace first.
                        let nextTraits = [...prev.traitIds];
                        if (nextTraits.includes(trId)) return prev;
                        if (nextTraits.length >= 3) {
                          nextTraits.shift();
                        }
                        nextTraits.push(trId);
                        return { ...prev, traitIds: nextTraits };
                      });
                    }}
                    onDeductRolls={(type, count) => {
                      if (type === "race") setRaceRollsOwned((r) => Math.max(0, r - count));
                      if (type === "trait") setTraitRollsOwned((t) => Math.max(0, t - count));
                    }}
                    playSfx={playSfx}
                  />
                )}

                {/* 4. COOPERATIVE WORLD RAID BOSS */}
                {activeTab === "raid" && (
                  <BossRaidPanel
                    playerStrength={getStrength()}
                    playerLevel={playerState.level}
                    onEarnGems={handleGrantGems}
                    playSfx={playSfx}
                    onLootItem={handleLootLootFromRaid => handleLootItem(handleLootLootFromRaid)}
                  />
                )}

                {/* 5. LEADERBOARD RANKING PANEL */}
                {activeTab === "multiplayer" && (
                  <LeaderboardPanel
                    playerLevel={playerState.level}
                    playerPrestige={playerState.prestige}
                    playerCoins={playerState.coins}
                    playerRaceName={activeRace.name}
                    playerRaceRarity={activeRace.rarity}
                    playerTraits={playerState.traitIds.map((tid) => TRAITS_LIST.find((t) => t.id === tid)?.name || tid)}
                    onSubmitProfile={handleProfileSubmit}
                    savedName={savedName}
                  />
                )}

                {/* 6. PREMIUM / BOOSTERS SHOP */}
                {activeTab === "premium" && (
                  <PremiumPanel
                    gems={playerState.gems}
                    hasXpBoost={playerState.hasXpBoost}
                    hasCoinBoost={playerState.hasCoinBoost}
                    hasAutoBattleUnlocked={playerState.hasAutoBattleUnlocked}
                    hasPrestigeEnhancement={playerState.hasPrestigeEnhancement}
                    hasVipStatus={playerState.hasVipStatus}
                    raceRollsOwned={raceRollsOwned}
                    traitRollsOwned={traitRollsOwned}
                    onBuyPremium={handleBuyPremium}
                    onBuyRolls={handleBuyRolls}
                    onGrantGems={handleGrantGems}
                    playSfx={playSfx}
                  />
                )}

                {/* 7. SAVE SLOTS AND EXPORTS */}
                {activeTab === "saves" && (
                  <SavesPanel
                    playerState={playerState}
                    savedName={savedName}
                    onManualSave={handleManualSave}
                    onImportState={handleImportState}
                    onHardReset={handleHardReset}
                  />
                )}

                {/* 8. COSMIC ASCENSION PRESTIGE PANEL */}
                {activeTab === "prestige" && (
                  <PrestigePanel
                    level={playerState.level}
                    prestige={playerState.prestige}
                    hasPrestigeEnhancement={playerState.hasPrestigeEnhancement}
                    onPerformPrestige={handlePerformPrestige}
                    onSetLevel={(lvl) => {
                      setPlayerState((prev) => ({ ...prev, level: lvl }));
                      pushCombatLog("level_up", `✨ Sandbox Mode: Character Level boosted to ${lvl}!`);
                    }}
                  />
                )}

                {/* 9. LOOT GEAR INVENTORY PANEL */}
                {activeTab === "inventory" && (
                  <InventoryPanel
                    inventory={inventory}
                    equipped={equipped}
                    onEquip={handleEquipItem}
                    onUnequip={handleUnequipItem}
                    onUpgrade={handleUpgradeItem}
                    onSell={handleSellItem}
                    onSellAllCommons={handleSellAllCommons}
                    onSellMultiple={handleSellMultipleItems}
                    autoSellSettings={autoSellSettings}
                    onUpdateAutoSellSettings={handleUpdateAutoSellSettings}
                    coins={playerState.coins}
                    playerLevel={playerState.level}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </section>

      </main>

      {/* FOOTER METADATA BAR */}
      <footer className="panel-glass m-3 mt-auto lg:m-3.5 lg:mt-auto py-2.5 px-4 shrink-0" id="game-footer-bar">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <Info size={11} className="shrink-0" />
            <span>Incremental Progression RPG Engine v1.8.0. Standard multi-tier arithmetic matrices.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>© 2026 Retro Idle Sandbox</span>
            <span className="text-slate-700">|</span>
            <span className="text-indigo-400">Auto Save Status: ACTIVE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
