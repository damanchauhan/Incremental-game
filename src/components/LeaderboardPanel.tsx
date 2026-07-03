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

// Helper to retrieve or initialize a unique persistent multiplayer player ID
const getPlayerId = () => {
  let pid = localStorage.getItem("multiplayer_player_id");
  if (!pid) {
    pid = "pid_" + Math.random().toString(36).substring(2, 11);
    localStorage.setItem("multiplayer_player_id", pid);
  }
  return pid;
};

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
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
  }, [savedName]);

  // Load and poll the active leaderboard and feed from the server
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        if (response.ok) {
          const data = await response.json();
          const myId = getPlayerId();
          const mappedLeaderboard = (data.leaderboard || []).map((p: any) => ({
            ...p,
            isRealPlayer: p.id === myId,
          }));
          setLeaderboard(mappedLeaderboard);
          setActivityFeed(data.activityFeed || []);
        }
      } catch (e) {
        console.error("Failed to fetch leaderboard from server:", e);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 4000);
    return () => clearInterval(interval);
  }, []);

  // Submit and update player stats on the server whenever relevant values change
  useEffect(() => {
    if (isRegistered && playerName) {
      const submitProfile = async () => {
        try {
          await fetch("/api/leaderboard/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: getPlayerId(),
              name: playerName,
              level: playerLevel,
              prestige: playerPrestige,
              raceName: playerRaceName,
              rarity: playerRaceRarity,
              traits: playerTraits,
              coins: playerCoins,
            }),
          });
        } catch (e) {
          console.error("Failed to submit leaderboard profile to server:", e);
        }
      };

      submitProfile();
      const interval = setInterval(submitProfile, 15000);
      return () => clearInterval(interval);
    }
  }, [isRegistered, playerName, playerLevel, playerPrestige, playerCoins, playerRaceName, playerRaceRarity, playerTraits]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim().substring(0, 16);
    if (!cleanName) return;
    onSubmitProfile(cleanName);
    setIsRegistered(true);

    // Sync immediately upon registration
    try {
      await fetch("/api/leaderboard/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: getPlayerId(),
          name: cleanName,
          level: playerLevel,
          prestige: playerPrestige,
          raceName: playerRaceName,
          rarity: playerRaceRarity,
          traits: playerTraits,
          coins: playerCoins,
        }),
      });
    } catch (err) {
      console.error("Failed to register profile to server leaderboard:", err);
    }
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
