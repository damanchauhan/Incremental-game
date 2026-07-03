import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

interface RaidLog {
  id: string;
  player: string;
  damage: number;
  isReal?: boolean;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // --- Shared Server-Side Raid State ---
  const BOSS_MAX_HP = 10000000; // 10 Million HP
  let bossHp = BOSS_MAX_HP;
  let timeLeft = 1800; // 30 minutes in seconds
  let raidLogs: RaidLog[] = [];
  let currentRaidId = Date.now().toString();

  // --- Shared Server-Side Leaderboard & Activity State ---
  interface LeaderboardPlayer {
    id: string;
    name: string;
    level: number;
    prestige: number;
    raceName: string;
    rarity: string;
    traits: string[];
    coins: number;
    totalDamage: number;
  }

  const leaderboard: Map<string, LeaderboardPlayer> = new Map();
  let activityFeed: string[] = [
    "Multiplayer ranking engine initialized.",
    "Submit your profile to join the global rankings!"
  ];

  // 1-second interval ticker for raid reset timer
  setInterval(() => {
    if (timeLeft > 1) {
      timeLeft--;
    } else {
      // Reset boss and cycle Raid ID
      bossHp = BOSS_MAX_HP;
      timeLeft = 1800;
      raidLogs = [
        { id: `reset_${Date.now()}`, player: "SYSTEM: BOSS RESPAWNED", damage: 0 }
      ];
      currentRaidId = Date.now().toString();
    }
  }, 1000);

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Get global leaderboard and activity feed
  app.get("/api/leaderboard", (req, res) => {
    const sorted = Array.from(leaderboard.values()).sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.level !== a.level) return b.level - a.level;
      return b.coins - a.coins;
    });
    res.json({
      leaderboard: sorted,
      activityFeed
    });
  });

  // Submit or update a player profile
  app.post("/api/leaderboard/submit", (req, res) => {
    const { id, name, level, prestige, raceName, rarity, traits, coins } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: "Missing player ID or name" });
    }

    const levelNum = Number(level) || 1;
    const prestigeNum = Number(prestige) || 0;
    const coinsNum = Number(coins) || 0;
    const totalDamage = levelNum * 300 + prestigeNum * 5000;

    const existing = leaderboard.get(id);

    if (existing) {
      if (levelNum > existing.level) {
        activityFeed.unshift(`${name} reached Level ${levelNum}!`);
      }
      if (prestigeNum > existing.prestige) {
        activityFeed.unshift(`${name} reset their stats and reached Prestige ${prestigeNum}!`);
      }
      if (raceName !== existing.raceName) {
        activityFeed.unshift(`${name} just rolled a ${rarity || "Common"} ${raceName} race!`);
      }
      const newTraits = (traits || []).filter((t: string) => !existing.traits.includes(t));
      if (newTraits.length > 0) {
        activityFeed.unshift(`${name} unlocked the legendary '${newTraits[0]}' trait!`);
      }
    } else {
      activityFeed.unshift(`${name} joined the multiplayer ranking lobby!`);
    }

    // Trim activity feed
    if (activityFeed.length > 20) {
      activityFeed = activityFeed.slice(0, 20);
    }

    leaderboard.set(id, {
      id,
      name,
      level: levelNum,
      prestige: prestigeNum,
      raceName: raceName || "Human",
      rarity: rarity || "Common",
      traits: Array.isArray(traits) ? traits : [],
      coins: coinsNum,
      totalDamage
    });

    res.json({ success: true });
  });

  // Client-triggered custom feed log
  app.post("/api/feed/log", (req, res) => {
    const { message } = req.body;
    if (message) {
      activityFeed.unshift(message);
      if (activityFeed.length > 20) {
        activityFeed = activityFeed.slice(0, 20);
      }
    }
    res.json({ success: true });
  });

  // Get current raid status
  app.get("/api/raid", (req, res) => {
    res.json({
      bossHp,
      bossMaxHp: BOSS_MAX_HP,
      timeLeft,
      raidLogs,
      currentRaidId
    });
  });

  // Apply a strike to the boss
  app.post("/api/raid/strike", (req, res) => {
    const { player, damage } = req.body;
    const damageNum = Math.max(0, Number(damage) || 0);

    if (bossHp > 0) {
      bossHp = Math.max(0, bossHp - damageNum);
      raidLogs.unshift({
        id: Math.random().toString(),
        player: player || "You (Hero)",
        damage: damageNum,
        isReal: true
      });

      if (raidLogs.length > 15) {
        raidLogs = raidLogs.slice(0, 15);
      }
    }

    res.json({
      bossHp,
      bossMaxHp: BOSS_MAX_HP,
      timeLeft,
      raidLogs,
      currentRaidId
    });
  });

  // Reset boss (for testing and convenient progression)
  app.post("/api/raid/reset", (req, res) => {
    bossHp = BOSS_MAX_HP;
    timeLeft = 1800;
    raidLogs = [
      { id: `manual_reset_${Date.now()}`, player: "SYSTEM: WORLD RESET", damage: 0 }
    ];
    currentRaidId = Date.now().toString();

    res.json({
      bossHp,
      bossMaxHp: BOSS_MAX_HP,
      timeLeft,
      raidLogs,
      currentRaidId
    });
  });

  // --- Vite Middleware Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
