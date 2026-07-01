/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Trophy, Eye, User, Sparkles, RefreshCw, MessageSquare, Flame } from "lucide-react";
import { LeaderboardPlayer, Rarity } from "../types";

interface LeaderboardPanelProps {
  playerLevel: number;
  playerPrestige: number;
  playerCoins: number;
  playerRaceName: string;
  playerRaceRarity: Rarity;
  playerTraits: string[];
  onSubmitProfile: (name: string) => void;
  savedName: string;
}

// Initial robust seed list of players for active competition
const INITIAL_LEADERBOARD: LeaderboardPlayer[] = [
  { id: "1", name: "VoidSovereign", level: 98, prestige: 8, raceName: "Dragonkin", rarity: Rarity.LEGENDARY, traits: ["Double Strike", "Time Warp"], coins: 145000000, totalDamage: 480000 },
  { id: "2", name: "OrcFrenzy", level: 82, prestige: 6, raceName: "Orc", rarity: Rarity.EPIC, traits: ["Adrenaline", "Bloodlust"], coins: 85000000, totalDamage: 320000 },
  { id: "3", name: "LegolasElf", level: 71, prestige: 5, raceName: "Elf", rarity: Rarity.UNCOMMON, traits: ["Double Strike"], coins: 34000000, totalDamage: 195000 },
  { id: "4", name: "DwarfDigger", level: 65, prestige: 4, raceName: "Dwarf", rarity: Rarity.RARE, traits: ["Gold Digger", "Bloodlust"], coins: 58000000, totalDamage: 140000 },
  { id: "5", name: "SlimeSlayer99", level: 48, prestige: 2, raceName: "Human", rarity: Rarity.COMMON, traits: ["Gold Digger"], coins: 12000000, totalDamage: 65000 },
  { id: "6", name: "ShadowStalker", level: 39, prestige: 2, raceName: "Elf", rarity: Rarity.UNCOMMON, traits: ["Bloodlust"], coins: 4500000, totalDamage: 45000 },
  { id: "7", name: "NoobGrinder", level: 25, prestige: 1, raceName: "Human", rarity: Rarity.COMMON, traits: [], coins: 120000, totalDamage: 15000 },
  { id: "8", name: "StoneBreaker", level: 14, prestige: 0, raceName: "Dwarf", rarity: Rarity.RARE, traits: [], coins: 15000, totalDamage: 4200 },
];

const FEEDS_POOL = [
  { template: "{name} reached Level {level}!", type: "level" },
  { template: "{name} just rolled a {rarity} {race} race!", type: "race" },
  { template: "{name} reset their stats and reached Prestige {prestige}!", type: "prestige" },
  { template: "{name} defeated the Area Boss and earned massive coins!", type: "boss" },
  { template: "{name} unlocked the legendary '{trait}' trait!", type: "trait" },
];

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  playerLevel,
  playerPrestige,
  playerCoins,
  playerRaceName,
  playerRaceRarity,
  playerTraits,
  onSubmitProfile,
  savedName,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(INITIAL_LEADERBOARD);
  const [activityFeed, setActivityFeed] = useState<string[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [inspectedPlayer, setInspectedPlayer] = useState<LeaderboardPlayer | null>(null);

  // Load from local saved state or initialize
  useEffect(() => {
    if (savedName) {
      setIsRegistered(true);
      setPlayerName(savedName);
    }
    
    // Seed initial activity logs
    setActivityFeed([
      "Welcome to the multiplayer progressive lobby!",
      "VoidSovereign just defeated Singularity Keeper!",
      "OrcFrenzy reached Prestige level 8.",
    ]);
  }, [savedName]);

  // Keep leaderboard updated with current player stats if registered
  useEffect(() => {
    if (isRegistered && playerName) {
      setLeaderboard((prev) => {
        const filtered = prev.filter((p) => p.id !== "player");
        const playerEntry: LeaderboardPlayer = {
          id: "player",
          name: `${playerName} (You)`,
          level: playerLevel,
          prestige: playerPrestige,
          raceName: playerRaceName,
          rarity: playerRaceRarity,
          traits: playerTraits,
          coins: playerCoins,
          totalDamage: playerLevel * 300 + playerPrestige * 5000,
          isRealPlayer: true,
        };
        const newList = [...filtered, playerEntry];
        // Sort by Prestige desc, then Level desc, then Coins desc
        return newList.sort((a, b) => {
          if (b.prestige !== a.prestige) return b.prestige - a.prestige;
          if (b.level !== a.level) return b.level - a.level;
          return b.coins - a.coins;
        });
      });
    }
  }, [isRegistered, playerName, playerLevel, playerPrestige, playerCoins, playerRaceName, playerRaceRarity, playerTraits]);

  // Simulate passive peer multiplayer activity over time
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random player to modify (excluding player)
      const nonPlayerIndices = leaderboard
        .map((p, idx) => (p.id !== "player" ? idx : -1))
        .filter((idx) => idx !== -1);

      if (nonPlayerIndices.length === 0) return;
      const targetIdx = nonPlayerIndices[Math.floor(Math.random() * nonPlayerIndices.length)];
      const targetPlayer = { ...leaderboard[targetIdx] };

      // Random event trigger
      const event = FEEDS_POOL[Math.floor(Math.random() * FEEDS_POOL.length)];
      let message = "";

      if (event.type === "level") {
        targetPlayer.level += Math.floor(Math.random() * 3) + 1;
        message = event.template
          .replace("{name}", targetPlayer.name)
          .replace("{level}", String(targetPlayer.level));
      } else if (event.type === "race") {
        const raceChoices = ["Orc", "Elf", "Dwarf", "Dragonkin"];
        const chosenRace = raceChoices[Math.floor(Math.random() * raceChoices.length)];
        const rarities = [Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY];
        const chosenRarity = rarities[Math.floor(Math.random() * rarities.length)];
        targetPlayer.raceName = chosenRace;
        targetPlayer.rarity = chosenRarity;
        message = event.template
          .replace("{name}", targetPlayer.name)
          .replace("{rarity}", chosenRarity)
          .replace("{race}", chosenRace);
      } else if (event.type === "prestige") {
        targetPlayer.prestige += 1;
        targetPlayer.level = 1;
        message = event.template
          .replace("{name}", targetPlayer.name)
          .replace("{prestige}", String(targetPlayer.prestige));
      } else if (event.type === "boss") {
        targetPlayer.coins += Math.floor(targetPlayer.level * 2500);
        message = event.template.replace("{name}", targetPlayer.name);
      } else if (event.type === "trait") {
        const traits = ["Bloodlust", "Gold Digger", "Adrenaline", "Time Warp", "Double Strike"];
        const chosenTrait = traits[Math.floor(Math.random() * traits.length)];
        if (!targetPlayer.traits.includes(chosenTrait)) {
          targetPlayer.traits = [...targetPlayer.traits, chosenTrait];
        }
        message = event.template
          .replace("{name}", targetPlayer.name)
          .replace("{trait}", chosenTrait);
      }

      // Update leaderboard list
      setLeaderboard((prev) => {
        const next = [...prev];
        next[targetIdx] = targetPlayer;
        return next.sort((a, b) => {
          if (b.prestige !== a.prestige) return b.prestige - a.prestige;
          if (b.level !== a.level) return b.level - a.level;
          return b.coins - a.coins;
        });
      });

      // Update feed
      if (message) {
        setActivityFeed((prev) => [message, ...prev.slice(0, 15)]);
      }
    }, 12000); // Trigger every 12s for active lobby feel

    return () => clearInterval(interval);
  }, [leaderboard]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim().substring(0, 16);
    if (!cleanName) return;
    onSubmitProfile(cleanName);
    setIsRegistered(true);
  };

  const getRarityBadgeColor = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.LEGENDARY:
        return "bg-amber-500/20 border-amber-500/40 text-amber-400";
      case Rarity.EPIC:
        return "bg-purple-500/20 border-purple-500/40 text-purple-400";
      case Rarity.RARE:
        return "bg-blue-500/20 border-blue-500/40 text-blue-400";
      case Rarity.UNCOMMON:
        return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
      default:
        return "bg-slate-700/20 border-slate-700/40 text-slate-300";
    }
  };

  return (
    <div className="space-y-4" id="leaderboard-panel-root">
      {/* Lobby Registration Header */}
      {!isRegistered ? (
        <form
          onSubmit={handleRegister}
          className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-3"
          id="registration-form"
        >
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sparkles size={16} />
            <span>Join Multiplayer Ranking Lobby</span>
          </div>
          <p className="text-xs text-slate-400">
            Publish your progression. Compare levels, prestige resets, and races with other live players in the server arena.
          </p>
          <div className="flex gap-2">
            <input
              id="input-player-name"
              type="text"
              placeholder="Enter hero name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={16}
              required
            />
            <button
              id="btn-register-profile"
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              Connect Profile
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">
              Connected as <strong className="text-emerald-400">{playerName}</strong>
            </span>
          </div>
          <button
            id="btn-change-profile-name"
            onClick={() => setIsRegistered(false)}
            className="text-slate-400 hover:text-slate-200 underline font-mono text-[10px]"
          >
            Change Name
          </button>
        </div>
      )}

      {/* Main Leaderboard & Activity Feed splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leaderboard Table (8 columns) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-400">
              <Trophy size={14} className="text-amber-500" />
              <span>Global Rankings</span>
            </div>
            <span className="text-[10px] text-slate-500">Live Active Players</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" id="leaderboard-table">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono text-[10px] pb-2">
                  <th className="py-1">Rank</th>
                  <th>Hero Name</th>
                  <th>Prestige</th>
                  <th>Level</th>
                  <th>Race</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {leaderboard.map((item, index) => {
                  const rank = index + 1;
                  let rankBadge = `${rank}`;
                  if (rank === 1) rankBadge = "🥇";
                  else if (rank === 2) rankBadge = "🥈";
                  else if (rank === 3) rankBadge = "🥉";

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        item.isRealPlayer ? "bg-emerald-950/10 font-medium" : ""
                      }`}
                      id={`leaderboard-row-${item.id}`}
                    >
                      <td className="py-2.5 font-mono text-center w-10 text-slate-400">
                        {rankBadge}
                      </td>
                      <td className="pr-2">
                        <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                          {item.isRealPlayer ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <User size={12} /> {item.name}
                            </span>
                          ) : (
                            <span className="text-slate-200">{item.name}</span>
                          )}
                        </span>
                      </td>
                      <td className="font-mono text-indigo-400">P-{item.prestige}</td>
                      <td className="font-mono text-slate-300">Lv.{item.level}</td>
                      <td>
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-semibold border rounded-md ${getRarityBadgeColor(
                            item.rarity
                          )}`}
                        >
                          {item.raceName}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          id={`btn-inspect-${item.id}`}
                          onClick={() => setInspectedPlayer(item)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 text-[10px] transition-all inline-flex items-center gap-1"
                        >
                          <Eye size={10} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Multiplayer Activity Ticker (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col h-[280px]">
          <div className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-slate-400 mb-3">
            <MessageSquare size={13} className="text-indigo-400" />
            <span>Multiplayer Log Feed</span>
          </div>

          <div
            id="multiplayer-activity-feed"
            className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[10px] text-slate-400 scrollbar-thin scrollbar-thumb-slate-800"
          >
            {activityFeed.map((log, index) => (
              <div
                key={index}
                className="p-1.5 rounded bg-slate-950/40 border border-slate-900/60 leading-relaxed text-slate-300 animate-in fade-in duration-200"
              >
                <span className="text-slate-500 mr-1.5">⚡</span>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {inspectedPlayer && (
        <div
          id="player-inspect-modal-overlay"
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setInspectedPlayer(null)}
        >
          <div
            id="player-inspect-modal-body"
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {inspectedPlayer.name}
                  </h3>
                  <p className="text-[10px] font-mono text-slate-500">
                    ID: {inspectedPlayer.id === "player" ? "REAL_HERO_LOCAL" : `PEER_${inspectedPlayer.id}`}
                  </p>
                </div>
              </div>
              <button
                id="btn-close-inspect-modal"
                onClick={() => setInspectedPlayer(null)}
                className="text-slate-400 hover:text-white font-semibold text-lg hover:bg-slate-800 px-2 py-0.5 rounded"
              >
                &times;
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 space-y-4">
              {/* Core Progression Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">Prestige Reset</span>
                  <span className="block text-lg font-bold text-indigo-400 font-mono">P-{inspectedPlayer.prestige}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <span className="block text-[10px] font-mono text-slate-500 uppercase">Current Level</span>
                  <span className="block text-lg font-bold text-slate-200 font-mono">Lv.{inspectedPlayer.level}</span>
                </div>
              </div>

              {/* Race details */}
              <div className="p-3 bg-slate-950/20 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Character Identity Race</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{inspectedPlayer.raceName}</span>
                  <span
                    className={`px-2 py-0.5 text-[9px] font-semibold border rounded-md uppercase tracking-wider ${getRarityBadgeColor(
                      inspectedPlayer.rarity
                    )}`}
                  >
                    {inspectedPlayer.rarity}
                  </span>
                </div>
              </div>

              {/* Active Traits */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Unlocked Passive Traits</span>
                {inspectedPlayer.traits.length === 0 ? (
                  <span className="text-xs text-slate-500 italic block">No active traits. Reach prestige levels to unlock.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {inspectedPlayer.traits.map((tr) => (
                      <span
                        key={tr}
                        className="px-2 py-1 bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <Sparkles size={10} /> {tr}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Inspect Stats estimates */}
              <div className="space-y-2 border-t border-slate-800/60 pt-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">Battle Power Estimator</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800/30">
                    <span className="text-slate-400">Est. Damage:</span>
                    <span className="text-slate-200 font-bold">
                      {(inspectedPlayer.level * 15 + inspectedPlayer.prestige * 200).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/30">
                    <span className="text-slate-400">Est. Health:</span>
                    <span className="text-slate-200 font-bold">
                      {(inspectedPlayer.level * 100 + inspectedPlayer.prestige * 1500).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/30 col-span-2">
                    <span className="text-slate-400">Wallet Coins:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      🪙 {inspectedPlayer.coins.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
              <button
                id="btn-inspect-close-footer"
                onClick={() => setInspectedPlayer(null)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;
