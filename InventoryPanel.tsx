/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Shield, 
  Trash2, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  Gem, 
  HelpCircle,
  Eye,
  Lock,
  ArrowUp,
  RefreshCw,
  Zap,
  Flame,
  Award,
  Check,
  CheckSquare,
  Square,
  Filter,
  ArrowUpDown,
  Settings2,
  Search,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Equipment, Rarity } from "../types";

interface InventoryPanelProps {
  inventory: Equipment[];
  equipped: Record<string, Equipment | null>;
  onEquip: (item: Equipment) => void;
  onUnequip: (slot: string) => void;
  onUpgrade: (item: Equipment) => void;
  onSell: (item: Equipment) => void;
  onSellAllCommons: () => void;
  onSellMultiple: (items: Equipment[]) => void;
  autoSellSettings: Record<string, boolean>;
  onUpdateAutoSellSettings: (settings: Record<string, boolean>) => void;
  coins: number;
  playerLevel: number;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  inventory,
  equipped,
  onEquip,
  onUnequip,
  onUpgrade,
  onSell,
  onSellAllCommons,
  onSellMultiple,
  autoSellSettings,
  onUpdateAutoSellSettings,
  coins,
  playerLevel,
}) => {
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  // Filter & Sort States
  const [selectedSlot, setSelectedSlot] = useState<string>("all");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rarity-desc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Auto Sell Drawer State
  const [isAutoSellOpen, setIsAutoSellOpen] = useState<boolean>(false);

  // Multi-Select Selling Mode States
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  // Helper for color based on rarity
  const getRarityStyles = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON:
        return {
          border: "border-slate-700/50 bg-slate-900/30",
          text: "text-slate-400",
          bg: "bg-slate-500/10",
          pill: "bg-slate-500/20 text-slate-300",
          glow: "shadow-none",
        };
      case Rarity.UNCOMMON:
        return {
          border: "border-emerald-500/20 bg-emerald-950/10",
          text: "text-emerald-400 font-medium",
          bg: "bg-emerald-500/10",
          pill: "bg-emerald-500/20 text-emerald-300",
          glow: "shadow-none",
        };
      case Rarity.RARE:
        return {
          border: "border-indigo-500/30 bg-indigo-950/10",
          text: "text-indigo-400 font-bold",
          bg: "bg-indigo-500/10",
          pill: "bg-indigo-500/20 text-indigo-300",
          glow: "shadow-none",
        };
      case Rarity.EPIC:
        return {
          border: "border-purple-500/40 bg-purple-950/15",
          text: "text-purple-400 font-extrabold",
          bg: "bg-purple-500/15",
          pill: "bg-purple-500/25 text-purple-300",
          glow: "shadow-none",
        };
      case Rarity.LEGENDARY:
        return {
          border: "border-amber-500/50 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
          text: "text-amber-400 font-black tracking-wide animate-pulse",
          bg: "bg-amber-500/20",
          pill: "bg-amber-500/30 text-amber-300",
          glow: "shadow-[0_0_8px_rgba(245,158,11,0.25)]",
        };
      case Rarity.MYTHICAL:
        return {
          border: "border-red-500 bg-red-950/25 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse",
          text: "text-red-500 font-black tracking-widest uppercase animate-pulse",
          bg: "bg-red-500/20",
          pill: "bg-red-500/35 text-red-100 border border-red-500/30",
          glow: "shadow-[0_0_12px_rgba(239,68,68,0.5)]",
        };
      default:
        return {
          border: "border-slate-800 bg-slate-900/20",
          text: "text-slate-400",
          bg: "bg-slate-500/10",
          pill: "bg-slate-500/20 text-slate-300",
          glow: "shadow-none",
        };
    }
  };

  // Sum up all equipped stats
  const sumStats = () => {
    const total = {
      strength: 0,
      maxHp: 0,
      critRate: 0,
      critDamage: 0,
      dodge: 0,
      coinMult: 0,
      expMult: 0,
    };
    (Object.values(equipped) as (Equipment | null)[]).forEach((item) => {
      if (!item) return;
      if (item.stats.strength) total.strength += item.stats.strength;
      if (item.stats.maxHp) total.maxHp += item.stats.maxHp;
      if (item.stats.critRate) total.critRate += item.stats.critRate;
      if (item.stats.critDamage) total.critDamage += item.stats.critDamage;
      if (item.stats.dodge) total.dodge += item.stats.dodge;
      if (item.stats.coinMult) total.coinMult += item.stats.coinMult;
      if (item.stats.expMult) total.expMult += item.stats.expMult;
    });
    return total;
  };

  const currentStatsSum = sumStats();

  const handleItemClick = (item: Equipment) => {
    if (isMultiSelectMode) {
      handleToggleSelectItem(item.id);
    } else {
      setSelectedItem(item);
    }
  };

  const handleEquipClick = (item: Equipment) => {
    if (playerLevel < item.requiredLevel) return;
    onEquip(item);
    setSelectedItem(null);
  };

  const handleUpgradeClick = (item: Equipment) => {
    if (coins < item.upgradeCost) return;
    onUpgrade(item);
    // Refresh selected item view with updated stats
    setSelectedItem((prev) => {
      if (!prev || prev.id !== item.id) return prev;
      const nextLevel = prev.level + 1;
      const updatedStats = { ...prev.stats };
      
      // Predict upgrades for display preview
      if (updatedStats.strength) updatedStats.strength = Math.round(updatedStats.strength * 1.25);
      if (updatedStats.maxHp) updatedStats.maxHp = Math.round(updatedStats.maxHp * 1.25);
      if (updatedStats.critRate) updatedStats.critRate = parseFloat((updatedStats.critRate + 0.002).toFixed(3));
      if (updatedStats.critDamage) updatedStats.critDamage = parseFloat((updatedStats.critDamage + 0.01).toFixed(3));
      if (updatedStats.dodge) updatedStats.dodge = parseFloat((updatedStats.dodge + 0.001).toFixed(3));
      if (updatedStats.coinMult) updatedStats.coinMult = parseFloat((updatedStats.coinMult + 0.005).toFixed(3));
      if (updatedStats.expMult) updatedStats.expMult = parseFloat((updatedStats.expMult + 0.005).toFixed(3));

      return {
        ...prev,
        level: nextLevel,
        stats: updatedStats,
        sellValue: Math.round(prev.sellValue * 1.2),
        upgradeCost: Math.round(prev.upgradeCost * 1.35),
      };
    });
  };

  const handleSellClick = (item: Equipment) => {
    onSell(item);
    setSelectedItem(null);
  };

  // Filter and Sort Processing
  const filteredAndSortedItems = inventory
    .filter((item) => {
      // Slot filter
      if (selectedSlot !== "all" && item.slot !== selectedSlot) return false;
      // Rarity filter
      if (selectedRarity !== "all" && item.rarity !== selectedRarity) return false;
      // Search text query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.slot.toLowerCase().includes(query) ||
          item.rarity.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rarity-desc" || sortBy === "rarity-asc") {
        const rarityWeights: Record<Rarity, number> = {
          [Rarity.COMMON]: 1,
          [Rarity.UNCOMMON]: 2,
          [Rarity.RARE]: 3,
          [Rarity.EPIC]: 4,
          [Rarity.LEGENDARY]: 5,
          [Rarity.MYTHICAL]: 6,
        };
        const weightA = rarityWeights[a.rarity] || 0;
        const weightB = rarityWeights[b.rarity] || 0;
        return sortBy === "rarity-desc" ? weightB - weightA : weightA - weightB;
      }
      if (sortBy === "level-desc") return b.level - a.level;
      if (sortBy === "level-asc") return a.level - b.level;
      if (sortBy === "value-desc") return b.sellValue - a.sellValue;
      if (sortBy === "value-asc") return a.sellValue - b.sellValue;
      return 0;
    });

  // Multi-Select Handlers
  const handleToggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllFiltered = () => {
    setSelectedItemIds(new Set(filteredAndSortedItems.map((item) => item.id)));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  const handleSelectByRarity = (rarity: Rarity) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      filteredAndSortedItems.forEach((item) => {
        if (item.rarity === rarity) {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  const handleBulkSellSelected = () => {
    const itemsToSell = inventory.filter((item) => selectedItemIds.has(item.id));
    if (itemsToSell.length === 0) return;

    onSellMultiple(itemsToSell);
    setSelectedItemIds(new Set());
    setIsMultiSelectMode(false);
  };

  const handleToggleAutoSellSetting = (rarity: Rarity) => {
    onUpdateAutoSellSettings({
      ...autoSellSettings,
      [rarity]: !autoSellSettings[rarity],
    });
  };

  // Calculate value of currently selected items
  const selectedItemsValue = inventory
    .filter((item) => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + item.sellValue, 0);

  const slotsDetails = [
    { key: "helmet", name: "Helmet / Headwear", icon: "🪖" },
    { key: "armor", name: "Armor / Torso", icon: "🛡️" },
    { key: "weapon", name: "Weapon / Offense", icon: "⚔️" },
    { key: "accessory", name: "Accessory / Trinket", icon: "💍" },
  ];

  return (
    <div className="space-y-4 h-full flex flex-col lg:min-h-0" id="inventory-panel-container">
      
      {/* 1. Header with details and Quick Actions */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/20 p-4 border border-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Shield size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              Loot & Gear Inventory
              <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                SYSTEM UPGRADED
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Equip looted gear to boost stats, or filter/sort to execute bulk sells and configure auto-sell rules.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Collapsible Auto-Sell toggle button */}
          <button
            onClick={() => setIsAutoSellOpen(!isAutoSellOpen)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
              isAutoSellOpen 
                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" 
                : "bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-slate-300"
            }`}
          >
            <Settings2 size={12} /> Auto-Sell Rules {isAutoSellOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {/* Sell Mode Toggle */}
          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              setSelectedItemIds(new Set());
              if (!isMultiSelectMode) {
                setSelectedItem(null); // Deselect inspecting item when entering multi-select
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
              isMultiSelectMode 
                ? "bg-rose-600 border border-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.25)]" 
                : "bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400"
            }`}
          >
            <CheckSquare size={12} /> {isMultiSelectMode ? "Cancel Sell Mode" : "Multi-Sell Mode"}
          </button>

          <span className="bg-slate-950/60 px-3 py-1.5 border border-white/5 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            Bag: <strong>{inventory.length} / 50</strong>
          </span>
        </div>
      </div>

      {/* Collapsible Auto-Sell Settings Panel */}
      {isAutoSellOpen && (
        <div className="shrink-0 bg-slate-950/40 border border-amber-500/20 p-4 rounded-xl animate-in slide-in-from-top-2 duration-150 space-y-3">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              ⚙️ Automated Loot Liquidator Rules
            </h4>
            <span className="text-[9px] text-slate-400 font-mono">
              Instantly converts newly dropped items into coins upon victory
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[Rarity.COMMON, Rarity.UNCOMMON, Rarity.RARE, Rarity.EPIC, Rarity.LEGENDARY].map((rarity) => {
              const active = autoSellSettings[rarity] || false;
              const rStyle = getRarityStyles(rarity);
              return (
                <button
                  key={rarity}
                  onClick={() => handleToggleAutoSellSetting(rarity)}
                  className={`p-2.5 rounded-lg border text-left font-mono text-[10px] flex items-center justify-between cursor-pointer transition-all ${
                    active 
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300" 
                      : "bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400 hover:bg-white/5"
                  }`}
                >
                  <span className={`font-bold ${active ? rStyle.text : "text-slate-500"}`}>{rarity}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    active ? "bg-amber-500 border-amber-400 text-slate-950" : "border-slate-700 bg-slate-950"
                  }`}>
                    {active && <Check size={11} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Layout: Left paper-doll & stats, Right inventory grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:min-h-0 lg:overflow-hidden">
        
        {/* Left Side: Equipped slots & Stats (5 columns) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto pr-1">
          
          {/* Paper-doll equipped panel */}
          <div className="panel-glass p-4 space-y-3.5">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block border-b border-white/5 pb-1 flex items-center gap-1">
              👤 Character Equipment Slots
            </span>

            <div className="grid grid-cols-2 gap-3">
              {slotsDetails.map((slotInfo) => {
                const item = equipped[slotInfo.key];
                const rarityStyle = item ? getRarityStyles(item.rarity) : null;

                return (
                  <div
                    key={slotInfo.key}
                    className={`p-3 rounded-lg border transition-all relative group flex flex-col justify-between h-24 ${
                      item 
                        ? `${rarityStyle?.border} ${rarityStyle?.bg}` 
                        : "border-dashed border-white/10 bg-slate-950/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">
                        {slotInfo.icon} {slotInfo.key}
                      </span>
                      {item && (
                        <span className="text-[9px] font-mono bg-slate-900/80 px-1 rounded border border-white/10 text-amber-300">
                          +{item.level}
                        </span>
                      )}
                    </div>

                    {item ? (
                      <div className="space-y-1">
                        <div className={`text-xs font-bold truncate ${rarityStyle?.text}`}>
                          {item.name.split(" (")[0]}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono truncate">
                          {Object.entries(item.stats).map(([statName, statVal]) => {
                            if (!statVal) return null;
                            const numericVal = Number(statVal);
                            const formattedVal = statName.includes("Mult") || statName.includes("Rate") || statName.includes("Damage") || statName === "dodge"
                              ? `+${Math.round(numericVal * 100)}%`
                              : `+${numericVal}`;
                            return `${statName.toUpperCase()}: ${formattedVal}`;
                          })}
                        </div>
                        
                        {/* Unequip action hover shield */}
                        <button
                          onClick={() => onUnequip(slotInfo.key)}
                          className="absolute inset-0 bg-rose-950/90 text-rose-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          ❌ Unequip
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-600 font-mono italic">
                        Empty Slot
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stat Bonuses Summary Card */}
          <div className="panel-glass p-4 space-y-2.5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block border-b border-white/5 pb-1 flex items-center gap-1">
              📊 Active Gear Stat Benefits
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">⚔️ Extra Offense Strength:</span>
                <span className="text-indigo-400 font-bold">+{currentStatsSum.strength}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">❤️ Extra Vitality Health:</span>
                <span className="text-emerald-400 font-bold">+{currentStatsSum.maxHp} HP</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">⚡ Critical Strike Chance:</span>
                <span className="text-amber-400 font-bold">+{Math.round(currentStatsSum.critRate * 100)}%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">💥 Critical Hit Multiplier:</span>
                <span className="text-purple-400 font-bold">+{Math.round(currentStatsSum.critDamage * 100)}%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">🌀 Dodge Counter Chance:</span>
                <span className="text-cyan-400 font-bold">+{Math.round(currentStatsSum.dodge * 100)}%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1">
                <span className="text-slate-400">🪙 Extra Coin Loot Yield:</span>
                <span className="text-amber-300 font-bold">+{Math.round(currentStatsSum.coinMult * 100)}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">✨ Extra EXP Training Boost:</span>
                <span className="text-indigo-300 font-bold">+{Math.round(currentStatsSum.expMult * 100)}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Inventory Grid & Filtering & Bulk Selling (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-3 lg:min-h-0">
          
          {/* Active Inspect/Details (only shows if an item is selected and not in multi-sell mode) */}
          {!isMultiSelectMode && selectedItem && (
            <div className={`panel-glass p-3 border rounded-xl animate-in fade-in slide-in-from-top-1 duration-150 relative ${getRarityStyles(selectedItem.rarity).border}`}>
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-white cursor-pointer font-mono text-[10px]"
              >
                ✕ Close
              </button>

              <div className="flex flex-col sm:flex-row gap-3 items-start justify-between">
                <div>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase tracking-widest font-mono font-bold ${getRarityStyles(selectedItem.rarity).pill}`}>
                    {selectedItem.rarity}
                  </span>
                  <h4 className="text-xs font-black text-white mt-1.5 flex items-center gap-1.5">
                    {selectedItem.name} 
                    <span className="text-[10px] text-amber-300 font-mono font-normal">Level +{selectedItem.level}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Slot: <strong className="text-indigo-400 capitalize">{selectedItem.slot}</strong> | Req. lvl: <strong className={playerLevel >= selectedItem.requiredLevel ? "text-emerald-400" : "text-rose-400"}>{selectedItem.requiredLevel}</strong>
                  </p>
                </div>

                <div className="flex gap-1.5 w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleEquipClick(selectedItem)}
                    disabled={playerLevel < selectedItem.requiredLevel}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase font-mono tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 shadow cursor-pointer active:scale-95 ${
                      playerLevel >= selectedItem.requiredLevel
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-slate-900/60 text-slate-500 cursor-not-allowed border border-white/5"
                    }`}
                  >
                    <Shield size={11} /> {playerLevel >= selectedItem.requiredLevel ? "Equip" : "Locked"}
                  </button>

                  <button
                    onClick={() => handleUpgradeClick(selectedItem)}
                    disabled={coins < selectedItem.upgradeCost}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-bold uppercase font-mono tracking-wider rounded-lg transition-all flex items-center justify-center gap-0.5 border cursor-pointer active:scale-95 ${
                      coins >= selectedItem.upgradeCost
                        ? "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400"
                        : "bg-slate-900/60 text-slate-500 border-white/5 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp size={11} /> Upgr ({selectedItem.upgradeCost} 🪙)
                  </button>

                  <button
                    onClick={() => handleSellClick(selectedItem)}
                    className="flex-1 sm:flex-none px-2.5 py-1.5 text-[10px] font-bold uppercase font-mono tracking-wider bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 active:scale-95"
                  >
                    Sell ({selectedItem.sellValue} 🪙)
                  </button>
                </div>
              </div>

              {/* Stats display of selected item */}
              <div className="mt-2.5 bg-slate-950/50 p-2 rounded-lg border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[9px] font-mono">
                {Object.entries(selectedItem.stats).map(([statKey, statVal]) => {
                  if (!statVal) return null;
                  const numericVal = Number(statVal);
                  const displayVal = statKey.includes("Mult") || statKey.includes("Rate") || statKey.includes("Damage") || statKey === "dodge"
                    ? `+${Math.round(numericVal * 100)}%`
                    : `+${numericVal}`;
                  return (
                    <div key={statKey} className="flex justify-between items-center border-b border-white/[0.02] pb-0.5">
                      <span className="text-slate-500 uppercase text-[8px]">{statKey}</span>
                      <span className="text-white font-bold">{displayVal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Mythical Set Bonus Panel */}
              {selectedItem.setName && (() => {
                const equippedList = Object.values(equipped) as (Equipment | null)[];
                const setPiecesCount = equippedList.filter((i) => i?.setName === selectedItem.setName).length;
                return (
                  <div className="mt-2.5 bg-red-950/20 p-2.5 rounded-lg border border-red-500/20 text-[9px] font-mono">
                    <div className="text-red-400 font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Sparkles size={10} className="animate-pulse text-red-500" /> Set: {selectedItem.setName}
                    </div>
                    <div className="text-slate-400 text-[8px] mb-2 flex justify-between">
                      <span>Equipped set pieces:</span>
                      <strong className="text-red-400">
                        {setPiecesCount}/4
                      </strong>
                    </div>
                    <div className="space-y-1.5 text-[8.5px] border-t border-red-500/10 pt-1.5">
                      {selectedItem.setName === "Aetherion's Voidlord" ? (
                        <>
                          <div className={`flex justify-between ${setPiecesCount >= 2 ? "text-red-400 font-bold" : "text-slate-500"}`}>
                            <span>[2-Piece Bonus]</span>
                            <span>+30% Strength, +10% Crit Rate</span>
                          </div>
                          <div className={`flex flex-col ${setPiecesCount >= 4 ? "text-red-400 font-bold" : "text-slate-500"}`}>
                            <div className="flex justify-between">
                              <span>[4-Piece Bonus] Void Infusion</span>
                              <span>Active: HP Heal & Double Dmg</span>
                            </div>
                            <span className="text-[7.5px] text-slate-400 font-normal mt-0.5">Attacks deal +100% damage and heal 10% of Max HP on every strike!</span>
                          </div>
                        </>
                      ) : selectedItem.setName === "Celestial Sunfire" ? (
                        <>
                          <div className={`flex justify-between ${setPiecesCount >= 2 ? "text-orange-400 font-bold" : "text-slate-500"}`}>
                            <span>[2-Piece Bonus]</span>
                            <span>+30% Max HP, +15% Dodge</span>
                          </div>
                          <div className={`flex flex-col ${setPiecesCount >= 4 ? "text-orange-400 font-bold" : "text-slate-500"}`}>
                            <div className="flex justify-between">
                              <span>[4-Piece Bonus] Supernova Flare</span>
                              <span>Active: Dual Strike & Dmg</span>
                            </div>
                            <span className="text-[7.5px] text-slate-400 font-normal mt-0.5">Grants +250% Crit Damage, Crit Cap is 95%, and Double Strike triggers on every attack!</span>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Filters & Actions Panel */}
          <div className="panel-glass p-3 space-y-2.5 shrink-0 bg-slate-950/15">
            {/* Search, Filter & Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              {/* Search Bar */}
              <div className="md:col-span-4 relative flex items-center">
                <Search size={12} className="absolute left-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search name/slot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-lg py-1.5 pl-8 pr-2.5 text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/40"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 text-slate-500 hover:text-white">
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Slot Filter */}
              <div className="md:col-span-4 flex rounded-lg border border-white/5 bg-slate-950/30 p-0.5">
                {["all", "weapon", "armor", "helmet", "accessory"].map((slot) => {
                  const isActive = selectedSlot === slot;
                  const label = slot === "all" ? "All" : slot === "weapon" ? "⚔️" : slot === "armor" ? "🛡️" : slot === "helmet" ? "🪖" : "💍";
                  const title = slot.toUpperCase();
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      title={title}
                      className={`flex-1 text-center py-1 rounded text-[10px] font-mono transition-all cursor-pointer ${
                        isActive ? "bg-indigo-500/20 text-indigo-300 font-bold" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Rarity & Sort Selector */}
              <div className="md:col-span-4 grid grid-cols-2 gap-1.5">
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="bg-slate-950/40 border border-white/5 rounded-lg py-1 px-1.5 text-[10px] font-mono text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">Any Rarity</option>
                  <option value={Rarity.COMMON}>Common</option>
                  <option value={Rarity.UNCOMMON}>Uncommon</option>
                  <option value={Rarity.RARE}>Rare</option>
                  <option value={Rarity.EPIC}>Epic</option>
                  <option value={Rarity.LEGENDARY}>Legendary</option>
                  <option value={Rarity.MYTHICAL}>Mythical</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950/40 border border-white/5 rounded-lg py-1 px-1.5 text-[10px] font-mono text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="rarity-desc">Rarity (High)</option>
                  <option value="rarity-asc">Rarity (Low)</option>
                  <option value="level-desc">Level (High)</option>
                  <option value="level-asc">Level (Low)</option>
                  <option value="value-desc">Value (High)</option>
                  <option value="value-asc">Value (Low)</option>
                </select>
              </div>
            </div>

            {/* Quick multi-select action row (only shows if multi select is ON) */}
            {isMultiSelectMode && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 animate-in fade-in duration-200">
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={handleSelectAllFiltered}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[9px] font-mono font-bold"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => handleSelectByRarity(Rarity.COMMON)}
                    className="px-2 py-1 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded text-[9px] font-mono font-bold"
                  >
                    + Commons
                  </button>
                  <button
                    onClick={() => handleSelectByRarity(Rarity.UNCOMMON)}
                    className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold"
                  >
                    + Uncommons
                  </button>
                  <button
                    onClick={() => handleSelectByRarity(Rarity.RARE)}
                    className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded text-[9px] font-mono font-bold"
                  >
                    + Rares
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded text-[9px] font-mono font-bold"
                  >
                    Deselect All
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Selected: <strong className="text-white">{selectedItemIds.size}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Grid Box of Items */}
          <div className="panel-glass p-4 flex-1 flex flex-col justify-between min-h-0 bg-slate-950/10">
            {inventory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                <div className="p-4 bg-slate-950/40 text-slate-600 rounded-full border border-white/5">
                  <Shield size={36} />
                </div>
                <h4 className="text-sm font-bold text-slate-400">Inventory is Empty</h4>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed max-w-sm">
                  Defeat level-appropriate monsters in the 🗺️ Adventure. There is a chance they drop randomized armor, helmets, weapons, and accessories!
                </p>
              </div>
            ) : filteredAndSortedItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 font-mono">
                <Filter size={24} className="mb-2 text-slate-600" />
                <p className="text-xs">No items match your active search filters.</p>
                <button
                  onClick={() => {
                    setSelectedSlot("all");
                    setSelectedRarity("all");
                    setSearchQuery("");
                  }}
                  className="mt-2 text-[10px] text-indigo-400 underline hover:text-indigo-300"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pb-4">
                  {filteredAndSortedItems.map((item, index) => {
                    const rStyle = getRarityStyles(item.rarity);
                    const isInspected = selectedItem?.id === item.id;
                    const isChecked = selectedItemIds.has(item.id);

                    return (
                      <button
                        key={`${item.id}_${index}`}
                        onClick={() => handleItemClick(item)}
                        className={`aspect-square p-1.5 rounded-xl border flex flex-col justify-between text-left relative group cursor-pointer transition-all ${
                          isInspected && !isMultiSelectMode
                            ? "ring-2 ring-indigo-500 border-indigo-400 scale-[1.02]"
                            : isChecked && isMultiSelectMode
                            ? "ring-2 ring-rose-500 border-rose-400 scale-[1.02]"
                            : `${rStyle.border} hover:scale-105 hover:border-slate-400/30`
                        } ${rStyle.bg}`}
                      >
                        {/* Header details in grid card */}
                        <div className="flex justify-between items-center w-full">
                          {isMultiSelectMode ? (
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-rose-600 border-rose-500 text-white" : "border-slate-600 bg-slate-950"
                            }`}>
                              {isChecked && <Check size={10} strokeWidth={3} />}
                            </div>
                          ) : (
                            <span className="text-[10px]" title={item.slot}>
                              {item.slot === "weapon" ? "⚔️" : item.slot === "armor" ? "🛡️" : item.slot === "helmet" ? "🪖" : "💍"}
                            </span>
                          )}
                          <span className="text-[8px] font-mono font-bold text-amber-300">
                            +{item.level}
                          </span>
                        </div>

                        {/* Rarity color dot visual indicator */}
                        <div 
                          className="absolute right-1.5 bottom-1.5 w-1.5 h-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: item.rarity === Rarity.COMMON ? "#64748b" : 
                                            item.rarity === Rarity.UNCOMMON ? "#10b981" : 
                                            item.rarity === Rarity.RARE ? "#6366f1" : 
                                            item.rarity === Rarity.EPIC ? "#a855f7" : 
                                            item.rarity === Rarity.LEGENDARY ? "#f59e0b" : "#ef4444" 
                          }} 
                        />

                        {/* Custom Name iLvl indicator label */}
                        <div className="text-[8px] font-mono text-slate-400 truncate w-full pr-1.5 font-bold">
                          {item.name.replace(" (iLvl ", " L")}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inventory Footer Block */}
            <div className="shrink-0 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] font-mono text-slate-500">
              <div className="flex items-center gap-1">
                <span>💡 Filtered: <strong>{filteredAndSortedItems.length}</strong> / {inventory.length} total</span>
              </div>
              
              {!isMultiSelectMode ? (
                <span>Click any gear item to inspect, equip, or upgrade</span>
              ) : (
                <span className="text-rose-400 font-bold animate-pulse">
                  Click items to mark them, then click the sell button below
                </span>
              )}
            </div>
          </div>

          {/* Floating Multi-Select Sell Action Drawer */}
          {isMultiSelectMode && selectedItemIds.size > 0 && (
            <div className="shrink-0 bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-150 shadow-[0_4px_20px_rgba(244,63,94,0.1)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Coins size={18} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white uppercase font-mono">
                    Ready to Liquidate Items
                  </h4>
                  <p className="text-[10px] text-rose-300 font-mono">
                    Selected: <strong>{selectedItemIds.size} items</strong> &bull; Total Value: <strong className="text-amber-300">{selectedItemsValue} 🪙</strong>
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 text-[10px] font-mono uppercase font-bold text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleBulkSellSelected}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 size={12} /> Sell Selected for {selectedItemsValue} 🪙
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default InventoryPanel;
