/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Volume2, VolumeX, Music, HelpCircle } from "lucide-react";
import { audio } from "../audio";

interface AudioControlsProps {
  musicVolume: number;
  sfxVolume: number;
  soundOn: boolean;
  onVolumeChange: (music: number, sfx: number, enabled: boolean) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  musicVolume,
  sfxVolume,
  soundOn,
  onVolumeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleMute = () => {
    onVolumeChange(musicVolume, sfxVolume, !soundOn);
    audio.setVolumes(musicVolume, sfxVolume, !soundOn);
    if (!soundOn) {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onVolumeChange(val, sfxVolume, soundOn);
    audio.setVolumes(val, sfxVolume, soundOn);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    onVolumeChange(musicVolume, val, soundOn);
    audio.setVolumes(musicVolume, val, soundOn);
  };

  const handleQuickUnmute = () => {
    audio.startMusic();
    onVolumeChange(musicVolume, sfxVolume, true);
    audio.setVolumes(musicVolume, sfxVolume, true);
  };

  return (
    <div className="relative inline-block text-left" id="audio-settings-container">
      <div className="flex items-center gap-2">
        <button
          id="btn-toggle-sound"
          onClick={handleToggleMute}
          className={`p-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-wider ${
            soundOn
              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/40"
              : "bg-slate-950/20 border-white/5 text-slate-400 hover:bg-slate-900/40"
          }`}
          title={soundOn ? "Mute All Sound" : "Unmute All Sound"}
        >
          {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundOn ? "Audio: ON" : "Audio: MUTED"}</span>
        </button>

        <button
          id="btn-sound-sliders"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-slate-950/20 border border-white/5 hover:bg-slate-900/40 text-slate-300 transition-all flex items-center justify-center cursor-pointer"
          title="Adjust Volume Channels"
        >
          <Music size={15} />
        </button>

        {!soundOn && (
          <button
            id="btn-quick-play-music"
            onClick={handleQuickUnmute}
            className="hidden sm:inline-flex px-2 py-1 text-[10px] bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-900/20 transition-all font-mono uppercase tracking-wider cursor-pointer"
          >
            🎵 Play Sound Track
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="volume-sliders-dropdown"
          className="absolute right-0 mt-2 w-64 panel-glass p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-white/5 flex items-center gap-1.5">
            <Music size={12} /> Audio Mixer Channels
          </h4>

          <div className="space-y-4">
            {/* Music volume slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300 uppercase tracking-wider">
                <span>Background Music</span>
                <span>{musicVolume}%</span>
              </div>
              <input
                id="slider-music-volume"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={handleMusicChange}
                disabled={!soundOn}
                className="w-full accent-emerald-500 bg-slate-950/40 border border-white/5 rounded appearance-none h-1.5 cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* SFX volume slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-300 uppercase tracking-wider">
                <span>Sound Effects (SFX)</span>
                <span>{sfxVolume}%</span>
              </div>
              <input
                id="slider-sfx-volume"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={handleSfxChange}
                disabled={!soundOn}
                className="w-full accent-emerald-500 bg-slate-950/40 border border-white/5 rounded appearance-none h-1.5 cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

          <div className="mt-3 text-[10px] font-mono text-slate-500 flex items-start gap-1">
            <HelpCircle size={10} className="mt-0.5 shrink-0" />
            <span>Sound effects are synthesized live in your browser utilizing the Web Audio API.</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default AudioControls;
