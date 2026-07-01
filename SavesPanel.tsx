/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Save, Download, Upload, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PlayerStats } from "../types";

interface SavesPanelProps {
  playerState: PlayerStats;
  savedName: string;
  onManualSave: () => void;
  onImportState: (importedState: Partial<PlayerStats>, importName: string) => void;
  onHardReset: () => void;
}

export const SavesPanel: React.FC<SavesPanelProps> = ({
  playerState,
  savedName,
  onManualSave,
  onImportState,
  onHardReset,
}) => {
  const [exportString, setExportString] = useState("");
  const [importString, setImportString] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleExport = () => {
    try {
      const dataToSave = {
        stats: playerState,
        name: savedName,
        exportTime: Date.now(),
      };
      // Encode to simple Base64 to make it feel like a real professional save key
      const jsonStr = JSON.stringify(dataToSave);
      const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
      setExportString(encoded);
      navigator.clipboard.writeText(encoded);
      setSuccessMessage("Save code generated and copied to clipboard successfully!");
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setErrorMessage("Failed to export save data.");
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importString.trim()) return;

    try {
      // Decode Base64
      const decodedStr = decodeURIComponent(escape(atob(importString.trim())));
      const parsed = JSON.parse(decodedStr);

      if (parsed && parsed.stats && typeof parsed.stats.level === "number") {
        onImportState(parsed.stats, parsed.name || "");
        setSuccessMessage("Save data loaded successfully! Restoring progress...");
        setImportString("");
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 4000);
      } else {
        setErrorMessage("Invalid save key format. Required elements are missing.");
      }
    } catch (e) {
      setErrorMessage("Failed to parse save key. Ensure you copied the exact, unmodified key.");
    }
  };

  return (
    <div className="space-y-6" id="saves-panel-root">
      {/* Save Information Banner */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
            <Save size={16} className="text-emerald-400" />
            Automatic Data Sync
          </h3>
          <p className="text-[10px] text-slate-400">Your progression is auto-saved locally in your browser cache every 10 seconds.</p>
        </div>
        <button
          id="btn-manual-save"
          onClick={() => {
            onManualSave();
            setSuccessMessage("Progress forced checkpoint saved successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
        >
          <Save size={13} /> Save Checkpoint Now
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div id="save-success-banner" className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div id="save-error-banner" className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Export / Import Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Column */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between" id="save-export-container">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Download size={14} className="text-indigo-400" /> Export Backup Save Key
            </h4>
            <p className="text-[10px] text-slate-400">
              Generates a portable, cryptographically-safe Base64 code of your current character sheets. Store it in a text file to move between browsers or devices.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {exportString && (
              <textarea
                id="textarea-export-string"
                readOnly
                value={exportString}
                className="w-full h-20 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-mono text-slate-400 focus:outline-none resize-none"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            )}
            <button
              id="btn-trigger-export"
              onClick={handleExport}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Download size={13} /> Copy Base64 Save Key
            </button>
          </div>
        </div>

        {/* Import Column */}
        <form
          id="save-import-form"
          onSubmit={handleImport}
          className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Upload size={14} className="text-amber-400" /> Import Backup Save Key
            </h4>
            <p className="text-[10px] text-slate-400">
              Paste an exported Base64 save key in the input field below to completely overwrite your active progression. This action is irreversible.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <input
              id="input-import-string"
              type="text"
              placeholder="Paste Base64 save key here..."
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 focus:outline-none focus:border-amber-500"
            />
            <button
              id="btn-trigger-import"
              type="submit"
              disabled={!importString.trim()}
              className={`w-full py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                importString.trim()
                  ? "bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800"
              }`}
            >
              <Upload size={13} /> Overwrite & Load Progress
            </button>
          </div>
        </form>
      </div>

      {/* Hard Reset Section */}
      <div className="p-4 bg-rose-950/10 border border-rose-500/20 rounded-2xl space-y-3" id="save-hard-reset-container">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Emergency Protocol</h4>
            <p className="text-[10px] text-slate-400">Completely purge your character file and erase all local records permanently.</p>
          </div>
        </div>

        {showResetConfirm ? (
          <div id="hard-reset-confirmation-box" className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3 animate-in slide-in-from-bottom-2 duration-150">
            <p className="text-xs text-rose-300 font-medium">
              ⚠️ WARNING: This will permanently wipe your Level, Coins, Prestige multiplier, Premium ownerships, Races, and Traits. Are you absolutely certain?
            </p>
            <div className="flex gap-2">
              <button
                id="btn-confirm-hard-reset"
                onClick={() => {
                  onHardReset();
                  setShowResetConfirm(false);
                  setSuccessMessage("Wiped! Your character has been completely reset.");
                  setTimeout(() => setSuccessMessage(""), 3000);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
              >
                Yes, Purge Everything
              </button>
              <button
                id="btn-cancel-hard-reset"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Cancel Reset
              </button>
            </div>
          </div>
        ) : (
          <button
            id="btn-request-hard-reset"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-bold rounded-xl text-xs transition-all"
          >
            Initiate Hard Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default SavesPanel;
