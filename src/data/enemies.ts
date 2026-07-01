/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Enemy } from "../types";
import sentinelOakImg from "../assets/images/sentinel_oak_1782859941133.jpg";
import lichKingImg from "../assets/images/lich_king_1782859956128.jpg";
import phoenixImg from "../assets/images/phoenix_1782859968437.jpg";
import singularityKeeperImg from "../assets/images/singularity_keeper_1782859981108.jpg";

// Normal enemy imports
import forestSlimeImg from "../assets/images/forest_slime_1782861235075.jpg";
import furiousSquirrelImg from "../assets/images/furious_squirrel_1782861249017.jpg";
import shadowWolfImg from "../assets/images/shadow_wolf_1782861261001.jpg";
import skeletonWarriorImg from "../assets/images/skeleton_warrior_1782861271198.jpg";
import cryptWraithImg from "../assets/images/crypt_wraith_1782861280742.jpg";
import gargoyleSentryImg from "../assets/images/gargoyle_sentry_1782861290818.jpg";
import magmaSpriteImg from "../assets/images/magma_sprite_1782861306499.jpg";
import fireGiantImg from "../assets/images/fire_giant_1782861317937.jpg";
import ashWyrmImg from "../assets/images/ash_wyrm_1782861330313.jpg";
import voidLurkerImg from "../assets/images/void_lurker_1782861340515.jpg";
import eclipseElementalImg from "../assets/images/eclipse_elemental_1782861351173.jpg";
import starDevourerImg from "../assets/images/star_devourer_1782861363496.jpg";

export interface GameArea {
  id: string;
  name: string;
  minLevel: number;
  description: string;
  enemies: Enemy[];
}

export const GAME_AREAS: GameArea[] = [
  {
    id: "woods",
    name: "Whispering Woods",
    minLevel: 1,
    description: "A sun-dappled ancient forest teeming with wild sprites and guardian beasts.",
    enemies: [
      {
        id: "slime",
        name: "Forest Slime",
        level: 1,
        maxHp: 20,
        damage: 2,
        expReward: 4,
        coinReward: 6,
        isBoss: false,
        imageSeed: "slime",
        areaName: "Whispering Woods",
        imageUrl: forestSlimeImg,
      },
      {
        id: "squirrel",
        name: "Furious Squirrel",
        level: 4,
        maxHp: 55,
        damage: 4,
        expReward: 9,
        coinReward: 14,
        isBoss: false,
        imageSeed: "squirrel",
        areaName: "Whispering Woods",
        imageUrl: furiousSquirrelImg,
      },
      {
        id: "wolf",
        name: "Shadow Wolf",
        level: 8,
        maxHp: 120,
        damage: 8,
        expReward: 20,
        coinReward: 30,
        isBoss: false,
        imageSeed: "wolf",
        areaName: "Whispering Woods",
        imageUrl: shadowWolfImg,
      },
      {
        id: "boss_oak",
        name: "Sentinel Oak (Boss)",
        level: 12,
        maxHp: 420,
        damage: 16,
        expReward: 120,
        coinReward: 180,
        isBoss: true,
        imageSeed: "sentinel_oak",
        areaName: "Whispering Woods",
        imageUrl: sentinelOakImg,
      },
    ],
  },
  {
    id: "crypt",
    name: "Dreaded Crypt",
    minLevel: 15,
    description: "A dark labyrinth filled with restless souls, crumbling stone, and ancient crypt guards.",
    enemies: [
      {
        id: "skeleton",
        name: "Skeleton Warrior",
        level: 16,
        maxHp: 380,
        damage: 22,
        expReward: 65,
        coinReward: 95,
        isBoss: false,
        imageSeed: "skeleton",
        areaName: "Dreaded Crypt",
        imageUrl: skeletonWarriorImg,
      },
      {
        id: "wraith",
        name: "Crypt Wraith",
        level: 20,
        maxHp: 620,
        damage: 32,
        expReward: 110,
        coinReward: 160,
        isBoss: false,
        imageSeed: "wraith",
        areaName: "Dreaded Crypt",
        imageUrl: cryptWraithImg,
      },
      {
        id: "gargoyle",
        name: "Gargoyle Sentry",
        level: 25,
        maxHp: 1100,
        damage: 48,
        expReward: 220,
        coinReward: 320,
        isBoss: false,
        imageSeed: "gargoyle",
        areaName: "Dreaded Crypt",
        imageUrl: gargoyleSentryImg,
      },
      {
        id: "boss_lich",
        name: "Lich King Malakor (Boss)",
        level: 30,
        maxHp: 3500,
        damage: 85,
        expReward: 1400,
        coinReward: 2000,
        isBoss: true,
        imageSeed: "lich_king",
        areaName: "Dreaded Crypt",
        imageUrl: lichKingImg,
      },
    ],
  },
  {
    id: "caldera",
    name: "Volcanic Caldera",
    minLevel: 35,
    description: "A scorched volcanic region where liquid lava rivers flow and fire elementals dwell.",
    enemies: [
      {
        id: "sprite",
        name: "Magma Sprite",
        level: 36,
        maxHp: 2400,
        damage: 95,
        expReward: 480,
        coinReward: 700,
        isBoss: false,
        imageSeed: "magma_sprite",
        areaName: "Volcanic Caldera",
        imageUrl: magmaSpriteImg,
      },
      {
        id: "giant",
        name: "Fire Giant",
        level: 45,
        maxHp: 5800,
        damage: 150,
        expReward: 950,
        coinReward: 1350,
        isBoss: false,
        imageSeed: "fire_giant",
        areaName: "Volcanic Caldera",
        imageUrl: fireGiantImg,
      },
      {
        id: "wyrm",
        name: "Ash Wyrm",
        level: 52,
        maxHp: 9600,
        damage: 210,
        expReward: 1800,
        coinReward: 2500,
        isBoss: false,
        imageSeed: "ash_wyrm",
        areaName: "Volcanic Caldera",
        imageUrl: ashWyrmImg,
      },
      {
        id: "boss_phoenix",
        name: "Infernal Phoenix (Boss)",
        level: 60,
        maxHp: 28000,
        damage: 380,
        expReward: 12000,
        coinReward: 18000,
        isBoss: true,
        imageSeed: "phoenix",
        areaName: "Volcanic Caldera",
        imageUrl: phoenixImg,
      },
    ],
  },
  {
    id: "void",
    name: "Astral Void",
    minLevel: 65,
    description: "The edge of known reality. Reality warps here, inhabited by cosmic horrors and dark stars.",
    enemies: [
      {
        id: "lurker",
        name: "Void Lurker",
        level: 66,
        maxHp: 22000,
        damage: 480,
        expReward: 4500,
        coinReward: 6500,
        isBoss: false,
        imageSeed: "void_lurker",
        areaName: "Astral Void",
        imageUrl: voidLurkerImg,
      },
      {
        id: "elemental",
        name: "Eclipse Elemental",
        level: 78,
        maxHp: 54000,
        damage: 720,
        expReward: 9800,
        coinReward: 14000,
        isBoss: false,
        imageSeed: "eclipse_elemental",
        areaName: "Astral Void",
        imageUrl: eclipseElementalImg,
      },
      {
        id: "devourer",
        name: "Star Devourer",
        level: 90,
        maxHp: 125000,
        damage: 1100,
        expReward: 24000,
        coinReward: 32000,
        isBoss: false,
        imageSeed: "star_devourer",
        areaName: "Astral Void",
        imageUrl: starDevourerImg,
      },
      {
        id: "boss_keeper",
        name: "Singularity Keeper (Boss)",
        level: 100,
        maxHp: 650000,
        damage: 2200,
        expReward: 150000,
        coinReward: 250000,
        isBoss: true,
        imageSeed: "singularity_keeper",
        areaName: "Astral Void",
        imageUrl: singularityKeeperImg,
      },
    ],
  },
];

