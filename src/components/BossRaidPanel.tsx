/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Flame, ShieldAlert, Sparkles, Timer, Users, Award, Globe } from "lucide-react";
import { audio } from "../audio";
import voidBehemothImg from "../assets/images/void_behemoth_1782859996623.jpg";

import { Equipment } from "../types";
import { generateMythicalSetItem } from "../utils/lootGenerator";

interface BossRaidPanelProps {
  playerStrength: number;
  playerLevel: number;
  onEarnGems: (amt: number) => void;
  playSfx: (type: "hit" | "crit" | "levelUp" | "dodge" | "prestige") => void;
  onLootItem: (item: Equipment) => void;
}

interface RaidLog {
  id: string;
  player: string;
  damage: number;
  isReal?: boolean;
}

export const BossRaidPanel: React.FC<BossRaidPanelProps> = ({
  playerStrength,
  playerLevel,
  onEarnGems,
  playSfx,
  onLootItem,
}) => {
  const BOSS_MAX_HP = 10000000; // 10 Million HP
  const [bossHp, setBossHp] = useState(6450200);
  const [personalDamage, setPersonalDamage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [raidLogs, setRaidLogs] = useState<RaidLog[]>([]);
  const [autoRaidOn, setAutoRaidOn] = useState(false);
  const [currentRaidId, setCurrentRaidId] = useState("");
  const [claimedRaidId, setClaimedRaidId] = useState<string>(() => {
    return localStorage.getItem("claimed_raid_id") || "";
  });

  const victoryRewardsClaimed = claimedRaidId === currentRaidId;

  // Fetch current state from the server
  const fetchRaidStatus = async () => {
    try {
      const response = await fetch("/api/raid");
      if (response.ok) {
        const data = await response.json();
        setBossHp(data.bossHp);
        setTimeLeft(data.timeLeft);
        setRaidLogs(data.raidLogs);
        setCurrentRaidId(data.currentRaidId);
      }
    } catch (error) {
      console.error("Failed to fetch raid status from server:", error);
    }
  };

  useEffect(() => {
    fetchRaidStatus();
    // Poll the server for updates every 3 seconds
    const interval = setInterval(fetchRaidStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Time ticker (decrements locally for smooth countdown in-between polling updates)
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchRaidStatus(); // Sync immediately when timer resets
          return 1800;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset personal damage tracking when a new raid boss cycle begins
  useEffect(() => {
    if (currentRaidId) {
      const lastRaidId = localStorage.getItem("last_raid_id");
      if (lastRaidId !== currentRaidId) {
        setPersonalDamage(0);
        localStorage.setItem("last_raid_id", currentRaidId);
      }
    }
  }, [currentRaidId]);

  // Format time (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle active user strike
  const handleStrike = async () => {
    if (bossHp <= 0) return;

    // Standard attack with potential crit (15% chance for visual flare)
    const isCrit = Math.random() < 0.15;
    const baseDamage = playerStrength * 2;
    const dmg = isCrit ? Math.floor(baseDamage * 2.5) : baseDamage;

    if (isCrit) {
      playSfx("crit");
    } else {
      playSfx("hit");
    }

    // Instantly apply local feedback so combat feels snappy and lag-free
    setBossHp((prev) => Math.max(0, prev - dmg));
    setPersonalDamage((prev) => prev + dmg);

    try {
      const response = await fetch("/api/raid/strike", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: "You (Hero)", damage: dmg })
      });
      if (response.ok) {
        const data = await response.json();
        setBossHp(data.bossHp);
        setTimeLeft(data.timeLeft);
        setRaidLogs(data.raidLogs);
        setCurrentRaidId(data.currentRaidId);
      }
    } catch (error) {
      console.error("Error submitting strike to server:", error);
      // Fallback local update if server is unreachable
      setRaidLogs((prev) => [
        { id: Math.random().toString(), player: "You (Hero)", damage: dmg, isReal: true },
        ...prev.slice(0, 8),
      ]);
    }
  };

  // Auto Strike Trigger
  useEffect(() => {
    if (!autoRaidOn || bossHp <= 0) return;

    const interval = setInterval(() => {
      handleStrike();
    }, 1200); // Strike every 1.2s

    return () => clearInterval(interval);
  }, [autoRaidOn, bossHp, playerStrength]);

  // Handle boss defeat rewards
  const handleClaimReward = () => {
    if (victoryRewardsClaimed) return;
    
    // Calculate gem reward based on damage percentage (minimum 5, capped at 100)
    const pct = personalDamage / BOSS_MAX_HP;
    const gemEarnings = Math.max(10, Math.min(150, Math.floor(pct * 3000) + 15));
    
    onEarnGems(gemEarnings);
    
    // Create 2 extremely OP Mythical set items
    const voidlordItem = generateMythicalSetItem(playerLevel, "Aetherion's Voidlord");
    const sunfireItem = generateMythicalSetItem(playerLevel, "Celestial Sunfire");
    
    onLootItem(voidlordItem);
    onLootItem(sunfireItem);
    
    playSfx("levelUp");
    
    // Mark as claimed for this raid ID
    localStorage.setItem("claimed_raid_id", currentRaidId);
    setClaimedRaidId(currentRaidId);
    
    setRaidLogs((prev) => [
      { id: `victory_${Date.now()}`, player: "SYSTEM: LOOT AWARDED", damage: 999999 },
      ...prev,
    ]);
  };

  const hpPercentage = (bossHp / BOSS_MAX_HP) * 100;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4" id="boss-raid-container">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
            <Flame size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
              Cooperative World Boss Raid
              <span className="px-1.5 py-0.5 text-[9px] bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-md uppercase font-mono animate-bounce">
                Live
              </span>
              <span className="px-1.5 py-0.5 text-[9px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-md uppercase font-mono flex items-center gap-1">
                <Globe size={10} className="text-indigo-400 animate-pulse" />
                Server Synced
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">All players online combine forces to conquer this titanic horror!</p>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-slate-500 flex items-center gap-1"><Timer size={13} /> Resets:</span>
          <span className="text-rose-400 font-bold">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {bossHp > 0 ? (
        <div className="space-y-4" id="boss-raid-alive-state">
          {/* Boss Info */}
          <div className="text-center p-4 bg-gradient-to-b from-rose-950/20 to-transparent border border-rose-500/20 rounded-xl space-y-3">
            <div className="text-[10px] font-mono text-rose-500 uppercase tracking-widest font-bold flex items-center justify-center gap-1">
              <ShieldAlert size={11} /> RAID BOSS LEVEL 150
            </div>
            
            {/* World Boss Image Portrait */}
            <div className="relative mx-auto w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-slate-950">
              <img
                src={voidBehemothImg}
                alt="Aetherion the Void Behemoth"
                className="w-full h-full object-cover animate-pulse"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-rose-600 text-white rounded text-[8px] font-bold font-mono tracking-wider uppercase">
                TITAN
              </span>
            </div>

            <h2 className="text-lg font-black tracking-tight text-white uppercase drop-shadow-md">
              Aetherion the Void Behemoth
            </h2>

            {/* HP Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
                <span>Health Points (HP)</span>
                <span className="text-rose-400 font-bold">
                  {bossHp.toLocaleString()} / {BOSS_MAX_HP.toLocaleString()} ({hpPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 h-full transition-all duration-300"
                  style={{ width: `${hpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              id="btn-raid-strike"
              onClick={handleStrike}
              className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Flame size={16} /> Deal Damage
            </button>

            <button
              id="btn-raid-autostrike"
              onClick={() => setAutoRaidOn(!autoRaidOn)}
              className={`py-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                autoRaidOn
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-400"
                  : "bg-slate-950/40 border-slate-700 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Users size={15} /> {autoRaidOn ? "⚔️ Auto Striking ON" : "⚔️ Start Auto Strike"}
            </button>
          </div>

          {/* Personal Stats */}
          <div className="grid grid-cols-2 gap-3 text-center bg-slate-950/40 border border-slate-800/80 p-3 rounded-xl font-mono text-xs">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">My Total Raid Damage</span>
              <span className="text-slate-200 font-bold text-sm">{personalDamage.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Contribution Share</span>
              <span className="text-rose-400 font-bold text-sm">
                {((personalDamage / BOSS_MAX_HP) * 100).toFixed(4)}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Victory State */
        <div className="text-center p-6 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-4 animate-bounce" id="boss-raid-defeated-state">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <Award size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-emerald-400 uppercase tracking-wide">Behemoth Vanquished!</h3>
            <p className="text-xs text-slate-300">
              Amazing coordination! The World Boss has been defeated by the community. Claim your loot chest reward.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 inline-block font-mono text-xs">
            <span className="text-slate-400 block mb-1">Your Final Contribution share:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {personalDamage.toLocaleString()} DMG ({((personalDamage / BOSS_MAX_HP) * 100).toFixed(3)}%)
            </span>
          </div>

          <div className="flex justify-center">
            {victoryRewardsClaimed ? (
              <span className="text-slate-500 text-xs font-semibold bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl">
                Reward Claimed! Waiting for Boss respawn...
              </span>
            ) : (
              <button
                id="btn-claim-raid-loot"
                onClick={handleClaimReward}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5 animate-pulse"
              >
                <Sparkles size={14} /> Open Boss Loot Chest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live combat contributions ticker */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Users size={10} /> Active Guild Contribution Log
        </h4>
        <div
          id="raid-damage-logs"
          className="h-28 overflow-y-auto bg-slate-950/80 rounded-xl p-2.5 border border-slate-800/80 font-mono text-[9px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-900"
        >
          {raidLogs.length === 0 ? (
            <div className="text-slate-600 italic text-center py-6">Raid active. Strike the boss to start combat logs!</div>
          ) : (
            raidLogs.map((log, index) => (
              <div
                key={`${log.id}_${index}`}
                className={`flex justify-between items-center px-1.5 py-0.5 rounded ${
                  log.isReal ? "bg-rose-950/20 border border-rose-500/20 text-rose-300" : "text-slate-400"
                }`}
              >
                <span>⚔️ <strong className={log.isReal ? "text-rose-400" : "text-slate-300"}>{log.player}</strong></span>
                <span className="font-bold text-slate-200">-{log.damage.toLocaleString()} damage</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BossRaidPanel;
