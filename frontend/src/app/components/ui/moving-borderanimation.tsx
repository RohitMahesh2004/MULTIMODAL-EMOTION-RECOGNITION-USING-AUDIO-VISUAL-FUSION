"use client";

import { GlowingEffect } from "@/app/components/ui/glowing-effect";
import { Button } from "@/app/components/ui/moving-border";

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full px-4 md:px-12 lg:px-32">
      <GridItem
        title="Emotion Recognition via Voice"
        description="End-to-end encryption with privacy-focused control."
        buttonText="Try Voice"
      />
      <GridItem
        title="Emotion Recognition via Video"
        description="Real-time emotion analysis powered by deep learning."
        buttonText="Try Video"
      />
      <GridItem
        title="Emotion Recognition via Audio & Video"
        description="Flexible configuration for multimodal inputs."
        buttonText="Try Multimodal"
      />
    </ul>
  );
}

interface GridItemProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
}

const GridItem = ({ title, description, buttonText }: GridItemProps) => {
  return (
    <li className="list-none">
      <div className="relative h-[30rem] w-full rounded-2xl border border-neutral-800 bg-black/80 p-2 md:p-4 overflow-hidden">
        {/* Glowing effect as background */}
        <div className="absolute inset-0 z-0">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
        </div>

        {/* Foreground content */}
        <div className="relative z-10 flex h-full flex-col justify-between rounded-xl border border-neutral-700 p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="text-sm text-neutral-400">{description}</p>
          </div>
          <div className="mt-auto flex justify-center pt-6">
            <Button
              borderRadius="1.75rem"
              className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};
