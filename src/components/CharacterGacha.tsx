/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Dices, Sparkles, Lock, ShieldAlert, Check, Zap } from "lucide-react";
import { Race, Trait, Rarity } from "../types";
import { RACES_LIST } from "../data/races";
import { TRAITS_LIST } from "../data/traits";

interface CharacterGachaProps {
  playerRaceId: string;
  playerTraitIds: string[];
  playerPrestige: number;
  raceRollsOwned: number;
  traitRollsOwned: number;
  onSetRace: (raceId: string) => void;
  onAddOrReplaceTrait: (traitId: string) => void;
  onDeductRolls: (type: "race" | "trait", count: number) => void;
  playSfx: (type: "hit" | "crit" | "levelUp" | "dodge" | "prestige") => void;
}

export const CharacterGacha: React.FC<CharacterGachaProps> = ({
  playerRaceId,
  playerTraitIds,
  playerPrestige,
  raceRollsOwned,
  traitRollsOwned,
  onSetRace,
  onAddOrReplaceTrait,
  onDeductRolls,
  playSfx,
}) => {
  // Gacha states
  const [isRollingRace, setIsRollingRace] = useState(false);
  const [isRollingTrait, setIsRollingTrait] = useState(false);
  const [isFastSpin, setIsFastSpin] = useState(false);
  const [displayedRaceName, setDisplayedRaceName] = useState("");
  const [displayedTraitName, setDisplayedTraitName] = useState("");
  const [rolledRace, setRolledRace] = useState<Race | null>(null);
  const [rolledTrait, setRolledTrait] = useState<Trait | null>(null);

  const activeRace = RACES_LIST.find((r) => r.id === playerRaceId) || RACES_LIST[0];

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.MYTHICAL:
        return "text-red-500 border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse font-extrabold";
      case Rarity.LEGENDARY:
        return "text-amber-400 border-amber-500 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
      case Rarity.EPIC:
        return "text-purple-400 border-purple-500 bg-purple-950/20";
      case Rarity.RARE:
        return "text-blue-400 border-blue-500 bg-blue-950/20";
      case Rarity.UNCOMMON:
        return "text-emerald-400 border-emerald-500 bg-emerald-950/20";
      default:
        return "text-slate-300 border-slate-700 bg-slate-900/40";
    }
  };

  const getRarityBadge = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.MYTHICAL:
        return "border-red-500/50 text-red-500 bg-red-500/10 animate-pulse font-extrabold";
      case Rarity.LEGENDARY:
        return "border-amber-500/50 text-amber-400 bg-amber-500/10";
      case Rarity.EPIC:
        return "border-purple-500/50 text-purple-400 bg-purple-500/10";
      case Rarity.RARE:
        return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case Rarity.UNCOMMON:
        return "border-emerald-500/50 text-emerald-400 bg-emerald-500/10";
      default:
        return "border-slate-700 text-slate-400 bg-slate-800/20";
    }
  };

  // Roll Race logic
  const handleRollRace = () => {
    if (raceRollsOwned <= 0 || isRollingRace) return;
    setIsRollingRace(true);
    onDeductRolls("race", 1);
    setRolledRace(null);

    const availableRaces = RACES_LIST.filter(r => r.rarity !== Rarity.MYTHICAL || playerPrestige >= 200);

    // Dynamic slot-machine cycle animation
    let cycles = 0;
    const maxCycles = isFastSpin ? 4 : 12;
    const intervalTime = isFastSpin ? 20 : 150;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * availableRaces.length);
      setDisplayedRaceName(availableRaces[randomIdx].name);
      playSfx("hit");
      cycles++;

      if (cycles > maxCycles) {
        clearInterval(interval);
        // Weighted roll selection
        const totalWeight = availableRaces.reduce((acc, r) => acc + r.rollChance, 0);
        const rand = Math.random() * totalWeight;
        let selected: Race = availableRaces[0];
        let cumulative = 0;

        // Sort race list by roll chance asc or run cumulative weights
        for (const r of availableRaces) {
          cumulative += r.rollChance;
          if (rand <= cumulative) {
            selected = r;
            break;
          }
        }

        setRolledRace(selected);
        setDisplayedRaceName(selected.name);
        onSetRace(selected.id);
        setIsRollingRace(false);

        // Highlight rare unlocks with cool sounds
        if (selected.rarity === Rarity.MYTHICAL || selected.rarity === Rarity.LEGENDARY || selected.rarity === Rarity.EPIC) {
          playSfx("prestige");
        } else {
          playSfx("levelUp");
        }
      }
    }, intervalTime);
  };

  // Roll Trait logic
  const handleRollTrait = () => {
    if (traitRollsOwned <= 0 || isRollingTrait || playerPrestige < 1) return;
    setIsRollingTrait(true);
    onDeductRolls("trait", 1);
    setRolledTrait(null);

    const availableTraits = TRAITS_LIST.filter(t => t.rarity !== Rarity.MYTHICAL || playerPrestige >= 200);

    let cycles = 0;
    const maxCycles = isFastSpin ? 4 : 12;
    const intervalTime = isFastSpin ? 20 : 150;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * availableTraits.length);
      setDisplayedTraitName(availableTraits[randomIdx].name);
      playSfx("hit");
      cycles++;

      if (cycles > maxCycles) {
        clearInterval(interval);
        // Weighted selection
        const totalWeight = availableTraits.reduce((acc, t) => acc + t.rollChance, 0);
        const rand = Math.random() * totalWeight;
        let selected: Trait = availableTraits[0];
        let cumulative = 0;

        for (const t of availableTraits) {
          cumulative += t.rollChance;
          if (rand <= cumulative) {
            selected = t;
            break;
          }
        }

        setRolledTrait(selected);
        setDisplayedTraitName(selected.name);
        onAddOrReplaceTrait(selected.id);
        setIsRollingTrait(false);

        if (selected.rarity === Rarity.MYTHICAL || selected.rarity === Rarity.LEGENDARY || selected.rarity === Rarity.EPIC) {
          playSfx("prestige");
        } else {
          playSfx("levelUp");
        }
      }
    }, intervalTime);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="gacha-system-container">
      {/* Fast Spin configuration controller */}
      <div className="col-span-1 md:col-span-2 flex justify-between items-center bg-slate-950/30 p-3.5 border border-white/5 rounded-xl">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isFastSpin ? "bg-amber-500/10 text-amber-400" : "bg-slate-900 text-slate-500"}`}>
            <Zap size={16} className={isFastSpin ? "animate-pulse fill-amber-500/20 text-amber-400" : ""} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">Gacha Animation Speed</h3>
            <p className="text-[10px] text-slate-500">Accelerate the slots animation for instantaneous summoning.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setIsFastSpin(!isFastSpin);
            playSfx("hit");
          }}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
            isFastSpin
              ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              : "bg-slate-900 border-white/5 text-slate-400 hover:text-slate-300 hover:border-white/10"
          }`}
        >
          <Zap size={12} className={isFastSpin ? "text-amber-400 fill-amber-400" : ""} />
          Fast Spin: {isFastSpin ? "ON" : "OFF"}
        </button>
      </div>

      {/* Race Rolling Box */}
      <div className="panel-glass p-5 space-y-4" id="race-rolling-box">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Dices size={16} className="text-emerald-400 animate-spin" />
              Race Identity Gacha
            </h3>
            <p className="text-[10px] text-slate-500">Roll for permanent race passives & stat multipliers.</p>
          </div>
          <div className="bg-slate-950/40 px-2.5 py-1 border border-white/5 rounded-lg text-xs font-mono">
            <span className="text-slate-500 mr-1">Tokens:</span>
            <span className="text-emerald-400 font-bold">{raceRollsOwned}</span>
          </div>
        </div>

        {/* Current Active Race info */}
        <div className="p-3.5 bg-slate-950/20 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">My Active Race</span>
          <div className="flex justify-between items-center">
            <span className="text-sm font-black uppercase tracking-wider text-slate-200">{activeRace.name}</span>
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-md ${getRarityBadge(activeRace.rarity)}`}>
              {activeRace.rarity}
            </span>
          </div>
          <p className="text-xs text-slate-400 italic pt-1">{activeRace.description}</p>
        </div>

        {/* Roll Display slot */}
        <div className="h-28 flex flex-col justify-center items-center border border-dashed border-white/10 rounded-xl bg-slate-950/20 p-4 text-center">
          {isRollingRace ? (
            <div className="space-y-2 animate-pulse">
              <span className="text-xs font-mono text-slate-500 uppercase block font-bold">Summoning Race...</span>
              <span className="text-lg font-black tracking-widest text-emerald-400 uppercase font-mono">{displayedRaceName}</span>
            </div>
          ) : rolledRace ? (
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-400 font-mono flex items-center justify-center gap-1 font-bold uppercase tracking-wider">
                <Sparkles size={11} /> NEW RACE IDENTITY ROLLED!
              </span>
              <h4 className={`text-base font-black tracking-widest uppercase ${getRarityColor(rolledRace.rarity).split(" ")[0]}`}>
                {rolledRace.name}
              </h4>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold border rounded uppercase ${getRarityBadge(rolledRace.rarity)}`}>
                {rolledRace.rarity}
              </span>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">Ready to Roll. Pull the lever to find your destiny!</div>
          )}
        </div>

        {/* Roll action */}
        <button
          id="btn-roll-race"
          onClick={handleRollRace}
          disabled={raceRollsOwned <= 0 || isRollingRace}
          className={`w-full py-2.5 font-bold uppercase tracking-widest text-xs rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
            raceRollsOwned > 0 && !isRollingRace
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-400/20 text-white cursor-pointer"
              : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
          }`}
        >
          <Dices size={14} /> {isRollingRace ? "Rolling..." : "Spend 1 Roll Token"}
        </button>

        {/* Gacha Drop Rates */}
        <div className="border-t border-white/5 pt-3">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Roll Rates & Odds</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px]">
            {RACES_LIST.map((r) => {
              const isLocked = r.rarity === Rarity.MYTHICAL && playerPrestige < 200;
              return (
                <div key={r.id} className={`flex justify-between py-0.5 border-b border-white/5 ${isLocked ? "opacity-40" : ""}`}>
                  <span className="text-slate-400 uppercase flex items-center gap-1">
                    {r.name} ({r.rarity})
                    {isLocked && <Lock size={8} className="text-red-500 animate-pulse" />}
                  </span>
                  <span className={`${isLocked ? "text-red-400 font-bold" : "text-slate-200 font-bold"}`}>
                    {isLocked ? "LOCKED (P-200)" : `${(r.rollChance * 100).toFixed(1)}%`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trait Rolling Box */}
      <div className="panel-glass p-5 space-y-4" id="trait-rolling-box">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
              Special Trait Gacha
            </h3>
            <p className="text-[10px] text-slate-500">Roll for gameplay modifiers & game-altering quirks.</p>
          </div>
          <div className="bg-slate-950/40 px-2.5 py-1 border border-white/5 rounded-lg text-xs font-mono">
            <span className="text-slate-500 mr-1">Tokens:</span>
            <span className="text-indigo-400 font-bold">{traitRollsOwned}</span>
          </div>
        </div>

        {/* Prestige check */}
        {playerPrestige < 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950/20 border border-white/5 border-dashed rounded-xl space-y-3 text-center h-[280px]">
            <Lock size={28} className="text-slate-600 animate-bounce" />
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300 block">TRAIT INVENTORY LOCKED</span>
              <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Special Traits represent profound mastery. Reach at least <strong className="text-indigo-400">Prestige Level 1</strong> to unlock trait slots.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {/* Current Active Traits info */}
            <div className="p-3 bg-slate-950/20 border border-white/5 rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider">Active Master Traits</span>
              {playerTraitIds.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No traits active. Use tokens below to acquire talent traits.</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {playerTraitIds.map((trId) => {
                    const tr = TRAITS_LIST.find((t) => t.id === trId);
                    if (!tr) return null;
                    return (
                      <span
                        key={trId}
                        className="px-2 py-1 bg-indigo-950/20 border border-indigo-500/20 rounded text-xs text-indigo-300 font-mono font-medium flex items-center gap-1 shadow-sm"
                        title={tr.description}
                      >
                        <Check size={11} className="text-emerald-400" />
                        {tr.name} ({tr.rarity})
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Roll Display slot */}
            <div className="h-28 flex flex-col justify-center items-center border border-dashed border-indigo-500/10 rounded-xl bg-indigo-950/5 p-4 text-center">
              {isRollingTrait ? (
                <div className="space-y-2 animate-pulse">
                  <span className="text-xs font-mono text-slate-500 uppercase block font-bold">Awakening Talent...</span>
                  <span className="text-lg font-black tracking-widest text-indigo-400 uppercase font-mono">{displayedTraitName}</span>
                </div>
              ) : rolledTrait ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] text-indigo-400 font-mono flex items-center justify-center gap-1 font-bold uppercase tracking-wider">
                    <Sparkles size={11} /> UNIQUE PASSIVE AWAKENED!
                  </span>
                  <h4 className={`text-base font-black tracking-widest uppercase ${getRarityColor(rolledTrait.rarity).split(" ")[0]}`}>
                    {rolledTrait.name}
                  </h4>
                  <p className="text-[11px] text-slate-300 max-w-xs">{rolledTrait.description}</p>
                </div>
              ) : (
                <div className="text-slate-500 text-xs">Unleash ancestral traits. Requires Prestige P-1+.</div>
              )}
            </div>

            {/* Roll action */}
            <button
              id="btn-roll-trait"
              onClick={handleRollTrait}
              disabled={traitRollsOwned <= 0 || isRollingTrait}
              className={`w-full py-2.5 font-bold uppercase tracking-widest text-xs rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${
                traitRollsOwned > 0 && !isRollingTrait
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 border border-indigo-400/20 text-white cursor-pointer"
                  : "bg-slate-900/40 text-slate-500 border border-white/5 cursor-not-allowed"
              }`}
            >
              <Sparkles size={14} /> {isRollingTrait ? "Awakening..." : "Spend 1 Trait Roll Token"}
            </button>

            {/* Gacha Drop Rates */}
            <div className="border-t border-white/5 pt-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">Trait Drop Rates</span>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[9px]">
                {TRAITS_LIST.map((t) => {
                  const isLocked = t.rarity === Rarity.MYTHICAL && playerPrestige < 200;
                  return (
                    <div key={t.id} className={`flex justify-between py-0.5 border-b border-white/5 ${isLocked ? "opacity-40" : ""}`}>
                      <span className="text-slate-400 uppercase flex items-center gap-1">
                        {t.name} ({t.rarity})
                        {isLocked && <Lock size={8} className="text-red-500 animate-pulse" />}
                      </span>
                      <span className={`${isLocked ? "text-red-400 font-bold" : "text-slate-200 font-bold"}`}>
                        {isLocked ? "LOCKED (P-200)" : `${(t.rollChance * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterGacha;
