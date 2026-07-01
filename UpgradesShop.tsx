/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Coins, Flame, Shield, Award, Sparkles, Timer, Zap, Heart } from "lucide-react";

interface UpgradesShopProps {
  coins: number;
  // Levels
  tempStrengthLevel: number;
  tempHpLevel: number;
  tempAgilityLevel: number;
  tempCritLevel: number;
  tempCritDmgLevel: number;
  permCoinMultLevel: number;
  permExpMultLevel: number;
  permDamageMultLevel: number;
  permAutoSpeedLevel: number;
  // Handlers
  onBuyTempUpgrade: (type: "strength" | "hp" | "agility" | "crit" | "critDmg", cost: number) => void;
  onBuyPermUpgrade: (type: "coinMult" | "expMult" | "damageMult" | "autoSpeed", cost: number) => void;
}

export const UpgradesShop: React.FC<UpgradesShopProps> = ({
  coins,
  tempStrengthLevel,
  tempHpLevel,
  tempAgilityLevel,
  tempCritLevel,
  tempCritDmgLevel,
  permCoinMultLevel,
  permExpMultLevel,
  permDamageMultLevel,
  permAutoSpeedLevel,
  onBuyTempUpgrade,
  onBuyPermUpgrade,
}) => {
  // Helpers to calculate progressive costs
  const getTempStrengthCost = (lvl: number) => Math.floor(10 * Math.pow(1.15, lvl));
  const getTempHpCost = (lvl: number) => Math.floor(15 * Math.pow(1.16, lvl));
  const getTempAgilityCost = (lvl: number) => Math.floor(40 * Math.pow(1.22, lvl));
  const getTempCritCost = (lvl: number) => Math.floor(100 * Math.pow(1.25, lvl));
  const getTempCritDmgCost = (lvl: number) => Math.floor(150 * Math.pow(1.26, lvl));

  const getPermCoinCost = (lvl: number) => Math.floor(1000 * Math.pow(1.6, lvl));
  const getPermExpCost = (lvl: number) => Math.floor(1500 * Math.pow(1.65, lvl));
  const getPermDamageCost = (lvl: number) => Math.floor(2000 * Math.pow(1.7, lvl));
  const getPermAutoSpeedCost = (lvl: number) => Math.floor(5000 * Math.pow(2.2, lvl));

  // Values calculation
  const getStrengthVal = (lvl: number) => lvl * 2;
  const getHpVal = (lvl: number) => lvl * 15;
  const getAgilityVal = (lvl: number) => Math.min(35, lvl * 0.5); // Cap dodge at 35%
  const getCritVal = (lvl: number) => Math.min(50, lvl * 0.5); // Cap crit chance at 50%
  const getCritDmgVal = (lvl: number) => lvl * 0.05; // +5% crit damage multiplier per level

  return (
    <div className="space-y-6" id="upgrades-shop-root">
      {/* Coins Overview Widget */}
      <div className="p-4 panel-glass flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <Coins size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Available Balance</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              🪙 {coins.toLocaleString()} <span className="text-xs text-amber-500/70">Coins</span>
            </span>
          </div>
        </div>
        <div className="hidden sm:block text-right text-[10px] font-mono text-slate-500 leading-relaxed max-w-[200px]">
          Temporary upgrades reset upon Prestige. Permanent upgrades are retained forever.
        </div>
      </div>

      {/* Grid containing Temp (Combat) vs Perm upgrades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category 1: Temporary Combat Training */}
        <div className="panel-glass p-5 space-y-4" id="temp-combat-upgrades-section">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Zap size={16} />
              Combat Training (Temporary)
            </h3>
            <p className="text-[10px] text-slate-500">Direct stat boosts. Resets to Level 0 upon prestiging.</p>
          </div>

          <div className="space-y-3">
            {/* STRENGTH */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Strength Training</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {tempStrengthLevel} &rarr; <span className="text-red-400">+{getStrengthVal(tempStrengthLevel)} DMG</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-strength"
                onClick={() => onBuyTempUpgrade("strength", getTempStrengthCost(tempStrengthLevel))}
                disabled={coins < getTempStrengthCost(tempStrengthLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getTempStrengthCost(tempStrengthLevel)
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md shadow-amber-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getTempStrengthCost(tempStrengthLevel).toLocaleString()}
              </button>
            </div>

            {/* HEALTH */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                  <Heart size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Vitality Core</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {tempHpLevel} &rarr; <span className="text-emerald-400">+{getHpVal(tempHpLevel)} Max HP</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-hp"
                onClick={() => onBuyTempUpgrade("hp", getTempHpCost(tempHpLevel))}
                disabled={coins < getTempHpCost(tempHpLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getTempHpCost(tempHpLevel)
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md shadow-amber-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getTempHpCost(tempHpLevel).toLocaleString()}
              </button>
            </div>

            {/* AGILITY */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                  <Shield size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Refined Reflexes</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {tempAgilityLevel} &rarr; <span className="text-cyan-400">+{getAgilityVal(tempAgilityLevel).toFixed(1)}% Dodge</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-agility"
                onClick={() => onBuyTempUpgrade("agility", getTempAgilityCost(tempAgilityLevel))}
                disabled={coins < getTempAgilityCost(tempAgilityLevel) || getAgilityVal(tempAgilityLevel) >= 35}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  getAgilityVal(tempAgilityLevel) >= 35
                    ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
                    : coins >= getTempAgilityCost(tempAgilityLevel)
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md shadow-amber-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {getAgilityVal(tempAgilityLevel) >= 35 ? "MAXED" : `🪙 ${getTempAgilityCost(tempAgilityLevel).toLocaleString()}`}
              </button>
            </div>

            {/* CRITICAL RATE */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Focus Precision</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {tempCritLevel} &rarr; <span className="text-purple-400">+{getCritVal(tempCritLevel).toFixed(1)}% Crit Rate</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-crit"
                onClick={() => onBuyTempUpgrade("crit", getTempCritCost(tempCritLevel))}
                disabled={coins < getTempCritCost(tempCritLevel) || getCritVal(tempCritLevel) >= 50}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  getCritVal(tempCritLevel) >= 50
                    ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
                    : coins >= getTempCritCost(tempCritLevel)
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md shadow-amber-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {getCritVal(tempCritLevel) >= 50 ? "MAXED" : `🪙 ${getTempCritCost(tempCritLevel).toLocaleString()}`}
              </button>
            </div>

            {/* CRIT DAMAGE */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Sharp Blades</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {tempCritDmgLevel} &rarr; <span className="text-indigo-400">+{Math.round(getCritDmgVal(tempCritDmgLevel) * 100)}% Crit Dmg</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-critdmg"
                onClick={() => onBuyTempUpgrade("critDmg", getTempCritDmgCost(tempCritDmgLevel))}
                disabled={coins < getTempCritDmgCost(tempCritDmgLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getTempCritDmgCost(tempCritDmgLevel)
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-md shadow-amber-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getTempCritDmgCost(tempCritDmgLevel).toLocaleString()}
              </button>
            </div>
          </div>
        </div>

        {/* Category 2: Permanent Focus Upgrades */}
        <div className="panel-glass p-5 space-y-4" id="perm-focus-upgrades-section">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Award size={16} />
              Ancient Legacy (Permanent)
            </h3>
            <p className="text-[10px] text-slate-500">Deep structural multipliers that survive Prestige resets forever.</p>
          </div>

          <div className="space-y-3">
            {/* PERM COIN MULT */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                  <Coins size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Merchant Heritage</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {permCoinMultLevel} &rarr; <span className="text-amber-400">+{(permCoinMultLevel * 10)}% Coins forever</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-perm-coin"
                onClick={() => onBuyPermUpgrade("coinMult", getPermCoinCost(permCoinMultLevel))}
                disabled={coins < getPermCoinCost(permCoinMultLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getPermCoinCost(permCoinMultLevel)
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/30 shadow-md shadow-indigo-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getPermCoinCost(permCoinMultLevel).toLocaleString()}
              </button>
            </div>

            {/* PERM EXP MULT */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Ascendance Aura</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {permExpMultLevel} &rarr; <span className="text-indigo-400">+{(permExpMultLevel * 10)}% Experience forever</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-perm-exp"
                onClick={() => onBuyPermUpgrade("expMult", getPermExpCost(permExpMultLevel))}
                disabled={coins < getPermExpCost(permExpMultLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getPermExpCost(permExpMultLevel)
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/30 shadow-md shadow-indigo-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getPermExpCost(permExpMultLevel).toLocaleString()}
              </button>
            </div>

            {/* PERM DAMAGE MULT */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
                  <Flame size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Slayer Genesis</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {permDamageMultLevel} &rarr; <span className="text-rose-400">+{(permDamageMultLevel * 15)}% Damage output</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-perm-dmg"
                onClick={() => onBuyPermUpgrade("damageMult", getPermDamageCost(permDamageMultLevel))}
                disabled={coins < getPermDamageCost(permDamageMultLevel)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  coins >= getPermDamageCost(permDamageMultLevel)
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/30 shadow-md shadow-indigo-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                🪙 {getPermDamageCost(permDamageMultLevel).toLocaleString()}
              </button>
            </div>

            {/* PERM COMBAT COOLDOWN SPEED */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl flex items-center justify-between gap-2 hover:border-white/10 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                  <Timer size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Chronos Accelerator</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Lv. {permAutoSpeedLevel} &rarr; <span className="text-cyan-400">-{permAutoSpeedLevel * 4}% Attack delay</span>
                  </p>
                </div>
              </div>
              <button
                id="btn-buy-perm-speed"
                onClick={() => onBuyPermUpgrade("autoSpeed", getPermAutoSpeedCost(permAutoSpeedLevel))}
                disabled={coins < getPermAutoSpeedCost(permAutoSpeedLevel) || permAutoSpeedLevel >= 12}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider font-bold shrink-0 transition-all ${
                  permAutoSpeedLevel >= 12
                    ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-white/5"
                    : coins >= getPermAutoSpeedCost(permAutoSpeedLevel)
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/30 shadow-md shadow-indigo-950/40"
                    : "bg-slate-900/40 text-slate-500 cursor-not-allowed border border-white/5"
                }`}
              >
                {permAutoSpeedLevel >= 12 ? "MAXED" : `🪙 ${getPermAutoSpeedCost(permAutoSpeedLevel).toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradesShop;
