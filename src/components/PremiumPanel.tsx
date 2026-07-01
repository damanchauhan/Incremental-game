/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Gem, Sparkles, Zap, ShieldCheck, Award, Flame, Gift, Dices, RefreshCw } from "lucide-react";

interface PremiumPanelProps {
  gems: number;
  hasXpBoost: boolean;
  hasCoinBoost: boolean;
  hasAutoBattleUnlocked: boolean;
  hasPrestigeEnhancement: boolean;
  hasVipStatus: boolean;
  raceRollsOwned: number;
  traitRollsOwned: number;
  onBuyPremium: (itemType: "xpBoost" | "coinBoost" | "autoBattle" | "prestigeEnhance" | "vipStatus", cost: number) => void;
  onBuyRolls: (type: "race" | "trait", count: number, cost: number) => void;
  onGrantGems: (amt: number) => void;
  playSfx: (type: "hit" | "crit" | "levelUp" | "dodge" | "prestige") => void;
}

export const PremiumPanel: React.FC<PremiumPanelProps> = ({
  gems,
  hasXpBoost,
  hasCoinBoost,
  hasAutoBattleUnlocked,
  hasPrestigeEnhancement,
  hasVipStatus,
  raceRollsOwned,
  traitRollsOwned,
  onBuyPremium,
  onBuyRolls,
  onGrantGems,
  playSfx,
}) => {
  const [dailyClaimed, setDailyClaimed] = useState(false);

  const handleClaimDailyGems = () => {
    if (dailyClaimed) return;
    onGrantGems(50);
    setDailyClaimed(true);
    playSfx("levelUp");
  };

  const handleBuyGemsPack = (amt: number) => {
    onGrantGems(amt);
    playSfx("prestige");
  };

  return (
    <div className="space-y-6" id="premium-panel-root">
      {/* Gems Overview and Simulated Purchase */}
      <div className="p-5 bg-gradient-to-r from-slate-950/40 to-indigo-950/20 panel-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Gem size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest block">Premium Balance</span>
            <span className="text-2xl font-black font-mono text-indigo-400 flex items-center gap-1">
              💎 {gems.toLocaleString()} <span className="text-xs text-indigo-300/80">Gems</span>
            </span>
          </div>
        </div>

        {/* Claim Daily Gems & Dev Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-claim-daily-gems"
            onClick={handleClaimDailyGems}
            disabled={dailyClaimed}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
              dailyClaimed
                ? "bg-slate-950/40 border-white/5 text-slate-500 cursor-not-allowed"
                : "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 active:scale-95"
            }`}
          >
            <Gift size={14} /> {dailyClaimed ? "Gems Claimed" : "Claim 50 Daily Gems"}
          </button>

          <button
            id="btn-simulate-buy-gems"
            onClick={() => handleBuyGemsPack(500)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-indigo-400/20 active:scale-95 flex items-center gap-1 cursor-pointer"
            title="Simulate currency purchase for game testing"
          >
            <Sparkles size={13} /> Buy 500 Gems (Simulated)
          </button>
        </div>
      </div>

      {/* Cosmic Gacha Rolls Shop */}
      <div className="space-y-4" id="premium-rolls-shop-section">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Dices size={16} className="text-emerald-400 animate-spin-slow" />
            Cosmic Gacha Rolls Shop
          </h3>
          <p className="text-xs text-slate-500">
            Purchase Race and Trait rolls with your Gems to customize your entity's form, race tiers, and specialized combat traits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Race Rolls Card */}
          <div className="p-4 bg-slate-950/30 border border-cyan-500/10 rounded-xl flex flex-col justify-between gap-3 hover:border-cyan-500/25 hover:bg-slate-950/40 transition-all shadow-md shadow-slate-950/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin-slow text-cyan-400" /> Origin Race
                </span>
                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                  Owned: <strong className="text-cyan-400 font-black">{raceRollsOwned}</strong>
                </span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1">
                Aether Race Rolls
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Used in the Gacha tab to change your species. Roll for rare tiers like Elf, Voidborn, Celestial, Dragon, or Mythical!
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button
                  id="btn-buy-1-race-roll"
                  onClick={() => onBuyRolls("race", 1, 10)}
                  disabled={gems < 10}
                  className="px-3 py-2 bg-slate-900/60 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all hover:border-cyan-500/50 active:scale-95 cursor-pointer"
                >
                  <span className="text-[9px] uppercase text-slate-400 tracking-wider">1 Roll</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 font-bold">💎 10</span>
                </button>
                <button
                  id="btn-buy-10-race-rolls"
                  onClick={() => onBuyRolls("race", 10, 85)}
                  disabled={gems < 85}
                  className="px-3 py-2 bg-cyan-950/20 hover:bg-cyan-900/30 border border-cyan-500/50 text-cyan-200 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-lg shadow-cyan-950/20 cursor-pointer"
                >
                  <span className="text-[9px] uppercase text-cyan-300 tracking-widest font-black flex items-center gap-0.5 animate-pulse">
                    10 Rolls <span className="text-emerald-400 text-[8px] font-bold">(-15%)</span>
                  </span>
                  <span className="text-cyan-300 font-bold">💎 85</span>
                </button>
              </div>
            </div>
          </div>

          {/* Trait Rolls Card */}
          <div className="p-4 bg-slate-950/30 border border-amber-500/10 rounded-xl flex flex-col justify-between gap-3 hover:border-amber-500/25 hover:bg-slate-950/40 transition-all shadow-md shadow-slate-950/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <RefreshCw size={10} className="animate-spin-slow text-amber-400" /> Celestial Trait
                </span>
                <span className="text-slate-400 font-mono text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full border border-white/5">
                  Owned: <strong className="text-amber-400 font-black">{traitRollsOwned}</strong>
                </span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1">
                Abyssal Trait Rolls
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Used in the Gacha tab to roll for custom passive modifiers like Double Strike, Life Steal, Critical Mastery, and Void infusions.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1.5">
                <button
                  id="btn-buy-1-trait-roll"
                  onClick={() => onBuyRolls("trait", 1, 15)}
                  disabled={gems < 15}
                  className="px-3 py-2 bg-slate-900/60 hover:bg-slate-800 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all hover:border-amber-500/50 active:scale-95 cursor-pointer"
                >
                  <span className="text-[9px] uppercase text-slate-400 tracking-wider">1 Roll</span>
                  <span className="text-amber-400 flex items-center gap-0.5 font-bold">💎 15</span>
                </button>
                <button
                  id="btn-buy-10-trait-rolls"
                  onClick={() => onBuyRolls("trait", 10, 125)}
                  disabled={gems < 125}
                  className="px-3 py-2 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-500/50 text-amber-200 rounded-lg text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 shadow-lg shadow-amber-950/20 cursor-pointer"
                >
                  <span className="text-[9px] uppercase text-amber-300 tracking-widest font-black flex items-center gap-0.5 animate-pulse">
                    10 Rolls <span className="text-emerald-400 text-[8px] font-bold">(-16%)</span>
                  </span>
                  <span className="text-amber-300 font-bold">💎 125</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Convenience Items Shop */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <Award size={16} />
            Convenience & Progression Boosters
          </h3>
          <p className="text-xs text-slate-500">Gems are earned through Boss victories, Community Raids, and Prestige achievements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* XP BOOSTER */}
          <div className="p-4 bg-slate-950/20 border border-white/5 rounded-lg flex flex-col justify-between gap-3 hover:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Booster
                </span>
                {hasXpBoost && <span className="text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-0.5 uppercase tracking-wider">✓ Active</span>}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Enlightenment Incense (+50% XP)</h4>
              <p className="text-[11px] text-slate-400">
                Increases all experience earned from normal monsters and bosses by an additional 50% permanently.
              </p>
            </div>
            <button
              id="btn-buy-xp-boost"
              onClick={() => onBuyPremium("xpBoost", 75)}
              disabled={hasXpBoost || gems < 75}
              className={`w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded transition-all ${
                hasXpBoost
                  ? "bg-slate-950/20 border border-white/5 text-slate-600 cursor-not-allowed"
                  : gems >= 75
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/20"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {hasXpBoost ? "PERMANENTLY UNLOCKED" : "💎 75 Gems"}
            </button>
          </div>

          {/* COIN BOOSTER */}
          <div className="p-4 bg-slate-950/20 border border-white/5 rounded-lg flex flex-col justify-between gap-3 hover:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Booster
                </span>
                {hasCoinBoost && <span className="text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-0.5 uppercase tracking-wider">✓ Active</span>}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Greed Talisman (+50% Coins)</h4>
              <p className="text-[11px] text-slate-400">
                Increases all gold coins looted from slain enemies and bosses by 50% permanently.
              </p>
            </div>
            <button
              id="btn-buy-coin-boost"
              onClick={() => onBuyPremium("coinBoost", 75)}
              disabled={hasCoinBoost || gems < 75}
              className={`w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded transition-all ${
                hasCoinBoost
                  ? "bg-slate-950/20 border border-white/5 text-slate-600 cursor-not-allowed"
                  : gems >= 75
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/20"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {hasCoinBoost ? "PERMANENTLY UNLOCKED" : "💎 75 Gems"}
            </button>
          </div>

          {/* AUTO BATTLE SPEEDUP */}
          <div className="p-4 bg-slate-950/20 border border-white/5 rounded-lg flex flex-col justify-between gap-3 hover:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Automation
                </span>
                {hasAutoBattleUnlocked && <span className="text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-0.5 uppercase tracking-wider">✓ Active</span>}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Auto Battle Chronograph</h4>
              <p className="text-[11px] text-slate-400">
                Instantly unlocks and permits Auto Battle without needing Level 15 or previous requirements.
              </p>
            </div>
            <button
              id="btn-buy-auto-battle"
              onClick={() => onBuyPremium("autoBattle", 120)}
              disabled={hasAutoBattleUnlocked || gems < 120}
              className={`w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded transition-all ${
                hasAutoBattleUnlocked
                  ? "bg-slate-950/20 border border-white/5 text-slate-600 cursor-not-allowed"
                  : gems >= 120
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/20"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {hasAutoBattleUnlocked ? "PERMANENTLY UNLOCKED" : "💎 120 Gems"}
            </button>
          </div>

          {/* PRESTIGE ENHANCEMENT */}
          <div className="p-4 bg-slate-950/20 border border-white/5 rounded-lg flex flex-col justify-between gap-3 hover:border-white/10 transition-all">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Enhancement
                </span>
                {hasPrestigeEnhancement && <span className="text-emerald-400 font-mono font-bold text-[10px] flex items-center gap-0.5 uppercase tracking-wider">✓ Active</span>}
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Prestige Astral Core (+20% gains)</h4>
              <p className="text-[11px] text-slate-400">
                Receive +20% more permanent multipliers, race rolls, and trait rolls on every prestige.
              </p>
            </div>
            <button
              id="btn-buy-prestige-enhance"
              onClick={() => onBuyPremium("prestigeEnhance", 180)}
              disabled={hasPrestigeEnhancement || gems < 180}
              className={`w-full py-2 font-mono text-xs uppercase tracking-widest font-bold rounded transition-all ${
                hasPrestigeEnhancement
                  ? "bg-slate-950/20 border border-white/5 text-slate-600 cursor-not-allowed"
                  : gems >= 180
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-750 hover:from-indigo-500 hover:to-indigo-650 text-white cursor-pointer border border-indigo-400/20"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {hasPrestigeEnhancement ? "PERMANENTLY UNLOCKED" : "💎 180 Gems"}
            </button>
          </div>

          {/* VIP STATUS */}
          <div className="p-4 panel-glass flex flex-col justify-between gap-3 hover:border-white/10 transition-all md:col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck size={10} /> Exclusive VIP status
                </span>
                {hasVipStatus && <span className="text-amber-400 font-mono font-bold text-[11px] flex items-center gap-0.5 uppercase tracking-wider">★ VIP MEMBER</span>}
              </div>
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-1">
                Lobby VIP Badge & Royal Blessing
              </h4>
              <p className="text-xs text-slate-300">
                Unlock gold glowing credentials on the leaderboard, a unique crown badge, and a passive <strong className="text-emerald-400">+10% bonus</strong> to Max HP, Damage, Coin gain, and Experience gain.
              </p>
            </div>
            <button
              id="btn-buy-vip"
              onClick={() => onBuyPremium("vipStatus", 300)}
              disabled={hasVipStatus || gems < 300}
              className={`w-full py-2.5 font-mono text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                hasVipStatus
                  ? "bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)] cursor-default"
                  : gems >= 300
                  ? "bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white cursor-pointer shadow-lg shadow-indigo-950/40"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              {hasVipStatus ? "ROYAL VIP STATUS ACTIVE" : "💎 Unveil VIP Blessing (300 Gems)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPanel;
