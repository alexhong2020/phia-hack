"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RiArrowRightSLine, RiMagicLine, RiUser4Line, RiShoppingBagLine, RiSparklingFill, RiMapPinLine, RiGalleryLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [step, setStep] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [vote, setVote] = useState<null | 'cop' | 'drop'>(null);
  const steps = [
    {
      title: 'Onboarding',
      subtitle: 'Import images to build your Phia profile.',
      content: (
        <div className="flex flex-col items-center gap-4">
          <button
            className="px-6 py-2 rounded-full bg-white text-[#0a0e1a] font-semibold shadow hover:bg-gray-100 transition-all"
            onClick={() => setUploaded(true)}
            disabled={uploaded}
          >
            {uploaded ? 'Images Imported!' : 'Import Images'}
          </button>
          {uploaded && <span className="text-green-400">✓ Profile Created</span>}
        </div>
      ),
    },
    {
      title: 'For You & Celebrity Map',
      subtitle: 'AI-powered recommendations and celebrity outfit map.',
      content: (
        <div className="flex flex-col items-center gap-4">
          <button
            className="px-6 py-2 rounded-full bg-white text-[#0a0e1a] font-semibold shadow hover:bg-gray-100 transition-all"
            onClick={() => setShowMap((v) => !v)}
          >
            {showMap ? 'Hide Celebrity Map' : 'Show Celebrity Map'}
          </button>
          {showMap && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-900 text-white text-sm shadow border border-white/10">
              <b>Celebrity Map:</b> <br />
              <span>👗 Zendaya: Paris Fashion Week</span><br />
              <span>🧥 Timothée Chalamet: Venice Film Festival</span><br />
              <span>👚 Hailey Bieber: LA Street Style</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Social Fitting Room',
      subtitle: 'Vote on fits, get AI-enhanced try-ons with friends.',
      content: (
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${vote === 'cop' ? 'bg-green-500 text-white' : 'bg-white text-[#0a0e1a] hover:bg-gray-100'}`}
              onClick={() => setVote('cop')}
            >
              COP
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold shadow transition-all ${vote === 'drop' ? 'bg-red-500 text-white' : 'bg-white text-[#0a0e1a] hover:bg-gray-100'}`}
              onClick={() => setVote('drop')}
            >
              DROP
            </button>
          </div>
          {vote && <span className="text-green-400">{vote === 'cop' ? '🔥 Fit Approved!' : '👎 Try Again!'}</span>}
          <button
            className="mt-4 px-6 py-2 rounded-full bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all"
            onClick={() => setVote(null)}
          >
            AI Enhance
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white overflow-hidden relative font-sans">
      {/* Vignette and floating product placeholders */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
        <div className="absolute left-10 top-24 w-40 h-48 bg-white/5 rounded-2xl blur-2xl" />
        <div className="absolute right-20 top-40 w-32 h-40 bg-white/10 rounded-2xl blur-2xl" />
        <div className="absolute left-1/3 bottom-20 w-44 h-44 bg-white/10 rounded-2xl blur-2xl" />
        <div className="absolute right-1/4 bottom-32 w-36 h-36 bg-white/5 rounded-2xl blur-2xl" />
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/10" style={{
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(2px)'
            }} />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <span className="text-3xl font-serif italic font-bold tracking-tight">phia</span>
        <Link
          href="/phia"
          className="px-6 py-2 rounded-full bg-white text-[#0a0e1a] font-semibold shadow hover:bg-gray-100 transition-all text-base"
        >
          Get Extension
        </Link>
      </header>

      {/* Interactive Markdown Demo */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-xl flex flex-col items-center mt-24">
          <div className="mb-8 text-center">
            <div className="uppercase tracking-widest text-xs text-gray-300 mb-2">Phia Hackathon Demo</div>
            <h1 className="text-[2.2rem] md:text-[2.8rem] font-serif font-light leading-tight mb-2">
              <span className="font-bold italic">Phia</span> Interactive Demo
            </h1>
            <p className="text-base text-gray-200">Swipe or use arrows to explore the hack features.</p>
          </div>
          <div className="relative w-full flex items-center justify-center">
            {/* Left arrow */}
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 disabled:opacity-30"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              aria-label="Previous"
            >
              <span className="text-2xl">←</span>
            </button>
            {/* Card */}
            <div className="w-full max-w-md mx-auto bg-white/5 rounded-2xl p-8 shadow-xl border border-white/10 text-center transition-all duration-500">
              <div className="text-sm text-gray-300 mb-2">{`Step ${step + 1} of 3`}</div>
              <h2 className="text-2xl font-serif font-bold mb-2">{steps[step].title}</h2>
              <p className="mb-6 text-gray-200">{steps[step].subtitle}</p>
              {steps[step].content}
            </div>
            {/* Right arrow */}
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 disabled:opacity-30"
              onClick={() => setStep((s) => Math.min(2, s + 1))}
              disabled={step === 2}
              aria-label="Next"
            >
              <span className="text-2xl">→</span>
            </button>
          </div>
          {/* CTA after last card */}
          {step === 2 && (
            <div className="mt-8">
              <Link
                href="/phia"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-zinc-900 text-white font-bold text-lg hover:scale-105 transition-transform"
              >
                <RiSparklingFill className="size-5" />
                Try Phia Now
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-20 py-8">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            © 2026 Phia. Built at the Hack.
          </div>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <span className="hover:text-foreground cursor-pointer">Privacy</span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
/**
 * # 🛍️ Phia.com Interactive Demo
 *
 * Welcome to the Phia.com-inspired Next.js intro page!
 *
 * ## Features
 * - Deep blue/black background with vignette and floating product placeholders
 * - White/gray text, serif/italic headline, white pill button
 * - Interactive hero, Phia AI, and Social Fitting Room sections
 * - Modern, minimal, and clean UI
 *
 * ## How to Use
 * - Click "Get Extension" or "Try Phia Now" to simulate CTA actions
 * - Use the section buttons to explore AI recommendations and the Social Fitting Room
 *
 * ## Built for hackathon demo
 * - [x] True phia.com look & feel
 * - [x] Interactive hero and sections
 * - [x] Modern, minimal, and clean
 *
 * ---
 *
 * _Scroll down to interact with the live demo below!_
 */
