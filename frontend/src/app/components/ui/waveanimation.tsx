"use client";

import React from "react";
import { WavyBackground } from "@/app/components/ui/WavyBackground";
import { GlowingEffectDemo } from "@/app/components/ui/glowing-effectanimation";
import { orbitron } from '@/lib/font';
import { roboto } from '@/lib/font';

export function WavyBackgroundDemo() {
  return (
    <div className="w-full h-screen  relative">
      <WavyBackground className="w-full h-full">
        {/* Text Section */}
        <div
          className="relative z-10 text-center text-white font-sans pt-[12vh] pb-[12vh]"
        >
          <p className={`text-4xl md:text-5xl font-bold leading-tight ${orbitron.className}`}>
            MultiModal Emotion Recognition
          </p>
          <p className={`text-lg md:text-xl mt-2 text-neutral-300 ${roboto.className}`}>
            Combining the powers of LSTM and CNNs
          </p>
        </div>

        {/* Glowing Boxes Section */}
        <div className="relative z-10 ">
          <GlowingEffectDemo />
        </div>
      </WavyBackground>
    </div>
  );
}
