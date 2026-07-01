/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Crown, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Gem, 
  Award, 
  Coins, 
  Zap, 
  Play,
  ArrowRight
} from "lucide-react";

interface PrestigePanelProps {
  level: number;
  prestige: number;
  hasPrestigeEnhancement: boolean;
  onPerformPrestige: () => void;
  onSetLevel?: (lvl: number) => void;
}

export const PrestigePanel: React.FC<PrestigePanelProps> = ({
  level,
  prestige,
  hasPrestigeEnhancement,
  onPerformPrestige,
  onSetLevel,
}) => {
  const PRESTIGE_REQ_LEVEL = 50;
  const isEligible = level >= PRESTIGE_REQ_LEVEL;
  
  // Calculate rolls based on enhancement modifier (from App.tsx logic)
  const rollsMultiplier = hasPrestigeEnhancement ? 1.2 : 1.0;
  const raceRollsGranted = Math.max(2, Math.floor(3 * rollsMultiplier));
  const traitRollsGranted = Math.max(1, Math.floor(2 * rollsMultiplier));

  const progressPercent = Math.min(100, (level / PRESTIGE_REQ_LEVEL) * 100);

  return (
    <div className="space-y-6" id="prestige-panel-root">
      
      {/* 1. Header widget detailing current status */}
      <div className="p-5 panel-glass relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 rounded-2xl shadow-xl shadow-orange-950/20 shrink-0 animate-bounce">
            <Crown size={28} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">Cosmic Ascension Shrine</span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Prestige Rank: <span className="font-mono text-amber-300">P-{prestige}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Reset your level to transcend your mortal shell and claim divine power multipliers.
            </p>
          </div>
        </div>
        
        {/* Level checklist tracker */}
        <div className="flex flex-col items-center md:items-end font-mono">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Prestige Criteria</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-sm font-bold ${isEligible ? "text-emerald-400" : "text-amber-400"}`}>
              Level {level} / {PRESTIGE_REQ_LEVEL}
            </span>
            {isEligible ? (
              <CheckCircle2 size={14} className="text-emerald-400" />
            ) : (
              <Lock size={14} className="text-slate-500" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Visual Level Progress Bar Card */}
      <div className="panel-glass p-5 space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-400">Transcendent Progress</span>
          <span className={`${isEligible ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
            {isEligible ? "ELIGIBLE" : `${Math.round(progressPercent)}% Ready`}
          </span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isEligible 
                ? "bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(234,179,8,0.4)]" 
                : "bg-indigo-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>Level 1</span>
          <span>Level 50 (Ascension Threshold)</span>
        </div>
      </div>

      {/* 3. Expected Rewards on Prestige Reset */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 px-1">
          <Award size={14} className="text-amber-400" /> Expected Ascension Loot
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="panel-glass p-4 bg-slate-950/20 border-white/5 hover:border-indigo-500/20 transition-all space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg"><Sparkles size={14} /></span>
              <h4 className="text-xs font-bold text-slate-200">Roll Tokens</h4>
            </div>
            <div className="text-lg font-black text-indigo-300 font-mono">
              +{raceRollsGranted} Race / +{traitRollsGranted} Trait
            </div>
            <p className="text-[10px] text-slate-400">
              Used in Identity Gacha tab to roll cosmic races and permanent traits.
            </p>
          </div>

          <div className="panel-glass p-4 bg-slate-950/20 border-white/5 hover:border-amber-500/20 transition-all space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Gem size={14} /></span>
              <h4 className="text-xs font-bold text-slate-200">Booster Gems</h4>
            </div>
            <div className="text-lg font-black text-amber-300 font-mono">
              +50 Gems
            </div>
            <p className="text-[10px] text-slate-400">
              Purchase premium boosters like XP/Coin double-earnings or VIP Status.
            </p>
          </div>

          <div className="panel-glass p-4 bg-slate-950/20 border-white/5 hover:border-purple-500/20 transition-all space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Zap size={14} /></span>
              <h4 className="text-xs font-bold text-slate-200">Auto-Battle Lock</h4>
            </div>
            <div className="text-lg font-black text-purple-300 font-mono">
              UNLOCKED FOREVER
            </div>
            <p className="text-[10px] text-slate-400">
              Auto-Battle active toggles will be permanently unlocked on all levels.
            </p>
          </div>

        </div>
      </div>

      {/* 4. Comparison Columns: SACRIFICED VS RETAINED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sacrificed box */}
        <div className="panel-glass p-4 border-rose-500/10 bg-rose-950/5 space-y-3">
          <div className="flex items-center gap-1.5 border-b border-rose-500/10 pb-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 font-sans">
              Sacrificed on Reset
            </h4>
          </div>
          <ul className="space-y-2 text-[10px] font-mono text-slate-400">
            <li className="flex items-center gap-2 text-rose-200/70">
              <span className="text-rose-500">❌</span> Player Level resets back to 1
            </li>
            <li className="flex items-center gap-2 text-rose-200/70">
              <span className="text-rose-500">❌</span> Gold Coin Balance resets to 100
            </li>
            <li className="flex items-center gap-2 text-rose-200/70">
              <span className="text-rose-500">❌</span> Temporary Strength training resets to Lv. 0
            </li>
            <li className="flex items-center gap-2 text-rose-200/70">
              <span className="text-rose-500">❌</span> Temporary Vitality/Agility resets to Lv. 0
            </li>
            <li className="flex items-center gap-2 text-rose-200/70">
              <span className="text-rose-500">❌</span> Temporary Focus/Sharp Blades resets to Lv. 0
            </li>
          </ul>
        </div>

        {/* Retained box */}
        <div className="panel-glass p-4 border-emerald-500/10 bg-emerald-950/5 space-y-3">
          <div className="flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
            <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-sans">
              Retained Eternally
            </h4>
          </div>
          <ul className="space-y-2 text-[10px] font-mono text-slate-400">
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> Unlocked Race & currently active Traits
            </li>
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> Merchant Heritage (+Coins Mult) permanent training
            </li>
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> Ascendance Aura (+EXP Mult) permanent training
            </li>
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> Slayer Genesis (+Damage Mult) permanent training
            </li>
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> Chronos Accelerator (-Attack delay) permanent training
            </li>
            <li className="flex items-center gap-2 text-emerald-200/70">
              <span className="text-emerald-500">✅</span> VIP Status active & booster multipliers
            </li>
          </ul>
        </div>

      </div>

      {/* 5. Trigger Button section */}
      <div className="p-5 panel-glass bg-slate-950/40 text-center space-y-4">
        {isEligible ? (
          <div className="space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold uppercase tracking-widest font-mono">
              <Sparkles size={14} className="animate-spin" /> Gateways are Open <Sparkles size={14} className="animate-spin" />
            </div>
            <h4 className="text-sm font-bold text-slate-200">Ready to Transcend?</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              You meet the ascension criteria! Step into the celestial nexus to shed your mortal bindings and emerge into cosmic eternity with permanent rewards!
            </p>
            <button
              id="btn-trigger-prestige"
              onClick={onPerformPrestige}
              className="w-full py-4 rounded-xl font-bold font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-amber-400 via-indigo-500 to-purple-600 hover:from-amber-300 hover:via-indigo-400 hover:to-purple-500 text-slate-950 hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-indigo-950/40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Crown size={15} /> Transcend Now <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-md mx-auto py-2">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-bold uppercase tracking-widest font-mono">
              <Lock size={14} /> Shrine Sealed <Lock size={14} />
            </div>
            <h4 className="text-sm font-bold text-slate-400">Ascension gates are currently locked</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
              Requires level <span className="text-amber-400/80 font-bold">50</span> to trigger a prestige reset. Progress further by defeating harder monsters in higher areas of the 🗺️ Adventure.
            </p>
            <div className="w-full py-3 bg-slate-900/30 text-slate-600 border border-white/5 rounded-xl font-mono text-[10px] uppercase tracking-wider font-bold select-none">
              🔒 Lock Active (Need {PRESTIGE_REQ_LEVEL - level} More Levels)
            </div>
            {onSetLevel && (
              <div className="pt-2">
                <button
                  id="btn-prestige-panel-cheat"
                  onClick={() => onSetLevel(50)}
                  className="w-full py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  ⚡ Sandbox Mode: Instantly Set Level 50
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default PrestigePanel;
