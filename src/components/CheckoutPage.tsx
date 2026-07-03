/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShieldCheck, Gem, CreditCard, ArrowLeft, Loader2, CheckCircle2, Lock, Sparkles, AlertCircle, Laptop, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface GemPack {
  id: string;
  name: string;
  gems: number;
  price: string;
  priceNum: number;
  tag?: string;
  description: string;
}

interface CheckoutPageProps {
  pack: GemPack;
  onComplete: (gemsEarned: number) => void;
  onCancel: () => void;
  playSfx: (type: "hit" | "crit" | "levelUp" | "dodge" | "prestige") => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  pack,
  onComplete,
  onCancel,
  playSfx,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cosmicpay" | "paypal">("card");
  const [cardNumber, setCardNumber] = useState("4000 1234 5678 9010");
  const [cardName, setCardName] = useState("CHOSEN HERO");
  const [cardExpiry, setCardExpiry] = useState("12/30");
  const [cardCvv, setCardCvv] = useState("777");
  
  const [checkoutStage, setCheckoutStage] = useState<"idle" | "processing" | "success">("idle");
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "📡 Establishing encrypted tunnel TLS 1.3...",
    "🔒 Handshaking with Galactic Royal Treasury...",
    "🛡️ Executing anti-fraud verification protocols...",
    "💱 Converting imperial fiat credits into high-purity Gacha Gems...",
    "💳 Authorizing safe transaction ledger tokens...",
    "✨ Minting 💎 " + pack.gems.toLocaleString() + " raw gems on block level...",
    "✅ Signature verified! Finalizing delivery state..."
  ];

  useEffect(() => {
    if (checkoutStage !== "processing") return;

    if (logIndex < logs.length) {
      const delay = 600 + Math.random() * 500;
      const timeout = setTimeout(() => {
        setProcessingLogs((prev) => [...prev, logs[logIndex]]);
        setLogIndex((prev) => prev + 1);
        playSfx("hit");
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCheckoutStage("success");
        playSfx("prestige");
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [checkoutStage, logIndex]);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStage("processing");
    setLogIndex(0);
    setProcessingLogs(["🚀 Initiating dynamic checkout request..."]);
    playSfx("levelUp");
  };

  const handleFinalize = () => {
    onComplete(pack.gems);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-slate-950/80 border border-indigo-500/20 rounded-2xl shadow-2xl backdrop-blur-md" id="checkout-container">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
        <button
          onClick={onCancel}
          disabled={checkoutStage === "processing"}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:border-white/10 rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
        >
          <ArrowLeft size={14} /> Back to Shop
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Secured by SSL GigaCrypt v2.5</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {checkoutStage === "idle" && (
          <motion.div
            key="checkout-idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Purchase Summary */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 bg-gradient-to-br from-indigo-950/30 to-slate-900/40 rounded-xl border border-indigo-500/15 space-y-4">
                <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                  Selected Package
                </span>
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Gem size={28} className="animate-pulse text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{pack.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-tight">{pack.description}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Aether Gem Count:</span>
                    <span className="font-mono font-bold text-indigo-400">💎 {pack.gems.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Processing Fee:</span>
                    <span className="font-mono text-emerald-400">FREE</span>
                  </div>
                  <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-200">Grand Total:</span>
                    <span className="text-xl font-black font-mono text-emerald-400">{pack.price}</span>
                  </div>
                </div>
              </div>

              {/* Secure Trust Badges */}
              <div className="p-4 bg-slate-900/30 border border-white/5 rounded-xl space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Lock size={12} className="text-indigo-400" /> Secure Payments
                </div>
                <p>
                  Your virtual payment credentials are never transmitted over external production servers. 
                  This simulator does not charge real currency.
                </p>
              </div>
            </div>

            {/* Payment Details Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleStartPayment} className="space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Select Payment Gateway</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 justify-center ${
                        paymentMethod === "card"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <CreditCard size={14} />
                      <span>Credit Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cosmicpay")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 justify-center ${
                        paymentMethod === "cosmicpay"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>CosmicPay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center gap-1 justify-center ${
                        paymentMethod === "paypal"
                          ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                          : "bg-slate-900 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <Globe size={14} />
                      <span>PayPal</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === "card" ? (
                  <div className="space-y-4">
                    {/* Simulated Credit Card Graphic */}
                    <div className="p-5 bg-gradient-to-tr from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 rounded-xl relative overflow-hidden shadow-xl space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                          ⚔️ HERO PLATINUM CARD
                        </span>
                        <CreditCard size={20} className="text-slate-400" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-slate-500 block">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1.5 text-sm font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-7 space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-slate-500 block">Cardholder Name</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-indigo-200 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-slate-500 block">Expiry</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full bg-slate-950/60 border border-white/10 rounded px-2.5 py-1 text-xs font-mono text-center text-indigo-200 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-slate-500 block">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-slate-950/60 border border-white/10 rounded px-2 px-2.5 py-1 text-xs font-mono text-center text-indigo-200 focus:outline-none focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : paymentMethod === "cosmicpay" ? (
                  <div className="p-5 bg-indigo-950/10 border border-indigo-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase font-mono">
                      <Sparkles size={14} /> CosmicPay Instant Sync
                    </div>
                    <p className="text-xs text-slate-400">
                      Connects directly to your interstellar core ledger. High frequency, low latency, completely offline-compatible.
                    </p>
                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-white/5">
                      <strong>Address Key:</strong> <code className="text-indigo-300">0xCosmic_777F9...2A1E</code>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 bg-blue-950/10 border border-blue-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase font-mono">
                      <Globe size={14} /> PayPal One-Touch Express
                    </div>
                    <p className="text-xs text-slate-400">
                      Secure checkout with your linked planetary savings balance.
                    </p>
                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded border border-white/5">
                      <strong>Email:</strong> <code className="text-blue-300">hero_grinder@universe.org</code>
                    </div>
                  </div>
                )}

                <button
                  id="btn-confirm-checkout"
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-sm font-mono uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock size={15} /> Authorize Payment & Buy ({pack.price})
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {checkoutStage === "processing" && (
          <motion.div
            key="checkout-processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 space-y-6"
          >
            <div className="relative">
              <Loader2 size={48} className="text-indigo-400 animate-spin" />
              <Gem size={20} className="text-indigo-300 absolute inset-0 m-auto animate-pulse" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-200">Processing Interstellar Order</h3>
              <p className="text-xs text-slate-400">Executing cryptographically secure settlement. Please do not close the portal.</p>
            </div>

            <div className="w-full max-w-md bg-slate-950/60 border border-white/5 p-4 rounded-xl font-mono text-[10px] space-y-1.5 h-44 overflow-y-auto scrollbar-thin select-none">
              {processingLogs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 ${
                    index === processingLogs.length - 1 ? "text-indigo-300 animate-pulse font-bold" : "text-slate-500"
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {checkoutStage === "success" && (
          <motion.div
            key="checkout-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10 space-y-6 flex flex-col items-center max-w-md mx-auto"
          >
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full animate-bounce">
              <CheckCircle2 size={48} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-wide">Purchase Completed!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Vault transaction confirmed! Your delivery was successful. 
                <strong className="text-emerald-400 font-mono font-bold block mt-1">
                  💎 {pack.gems.toLocaleString()} Gems have been added to your vault!
                </strong>
              </p>
            </div>

            <div className="w-full p-4 bg-slate-900/40 border border-white/5 rounded-xl space-y-2 text-left font-mono text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>Receipt Ref:</span>
                <span className="text-slate-300">#GEM-{(Date.now() % 100000000).toString(16).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Payer Account:</span>
                <span className="text-slate-300">hero_wallet_active</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-slate-300">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1.5 text-xs">
                <span className="font-bold text-slate-400">Total Charged:</span>
                <span className="text-emerald-400 font-bold">{pack.price} (Simulated)</span>
              </div>
            </div>

            <button
              id="btn-checkout-success-return"
              onClick={handleFinalize}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl text-sm font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-950/20 active:scale-98"
            >
              🚀 Return to Adventure
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckoutPage;
