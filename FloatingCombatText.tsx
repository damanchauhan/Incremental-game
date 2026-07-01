/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";

export interface FloatingText {
  id: string;
  text: string;
  x: number; // percentage left (e.g. 20 - 80)
  y: number; // percentage top (e.g. 30 - 70)
  type: "hit" | "crit" | "heal" | "dodge" | "enemy_hit";
}

interface FloatingCombatTextProps {
  items: FloatingText[];
}

export const FloatingCombatText: React.FC<FloatingCombatTextProps> = ({ items }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-30" id="combat-floating-texts-container">
      <AnimatePresence>
        {items.map((item) => {
          let styleClasses = "font-extrabold text-sm font-mono tracking-tight";
          
          if (item.type === "hit") {
            styleClasses += " text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-base";
          } else if (item.type === "crit") {
            styleClasses += " text-amber-400 text-xl font-black italic tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] uppercase";
          } else if (item.type === "heal") {
            styleClasses += " text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-base";
          } else if (item.type === "dodge") {
            styleClasses += " text-cyan-300 font-bold tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase italic text-xs";
          } else if (item.type === "enemy_hit") {
            styleClasses += " text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-sm";
          }

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, scale: 0.6, x: `${item.x}%`, y: `${item.y}%` }}
              animate={{
                opacity: [1, 1, 0.4, 0],
                scale: item.type === "crit" ? [0.6, 1.4, 1.1, 0.9] : [0.6, 1.1, 1.0, 0.8],
                y: [`${item.y}%`, `${item.y - 25}%`], // Rise up
                x: [`${item.x}%`, `${item.x + (Math.random() * 10 - 5)}%`], // Slightly drift left/right
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap"
              id={`fct-${item.id}`}
            >
              {item.type === "crit" && (
                <div className="text-[9px] font-mono font-bold text-amber-500 tracking-wider text-center uppercase -mb-1 animate-pulse">
                  CRITICAL!
                </div>
              )}
              {item.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FloatingCombatText;
