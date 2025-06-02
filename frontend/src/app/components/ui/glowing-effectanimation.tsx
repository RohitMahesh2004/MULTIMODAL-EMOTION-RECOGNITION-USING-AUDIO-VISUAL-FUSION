"use client";

import { FocusCard } from "@/app/components/ui/focus-cards";
import { Button } from "@/app/components/ui/moving-border";
import { useRouter } from "next/navigation";
import { roboto } from '@/lib/font';

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 w-full lg:px-22">
      <GridItem
        title="Emotion Recognition via Voice"
        description="This option analyzes emotions based on voice inputs. It uses advanced audio processing techniques to detect emotional states from the tone, pitch, and speech patterns in the voice."
        buttonText="Try Voice"
        link="/audio"
      />
      <GridItem
        title="Emotion Recognition via Visual"
        description="This option identifies emotions by analyzing facial expressions and visual cues from video inputs. It uses deep learning models to detect and classify emotions in real-time from the video feed."
        buttonText="Try Video"
        link="/visual"
      />
      <GridItem
        title="Combined Emotion Recognition"
        description="This combines both voice and video inputs for emotion recognition. By using both audio and visual data, it offers a more accurate and comprehensive analysis of the user's emotional state."
        buttonText="Try Multimodal"
        link="/multimodal"
      />
    </ul>
  );
}

interface GridItemProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  link: string;
}

const GridItem = ({ title, description, buttonText, link }: GridItemProps) => {
  const router = useRouter();

  return (
    <li className="list-none">
      <FocusCard>
        <div className="relative h-[20rem] w-full rounded-2xl border border-neutral-800 bg-black/80 p-2 md:p-4 overflow-hidden">
          {/* Foreground content */}
          <div className="relative z-10 flex h-full flex-col justify-between rounded-xl border border-neutral-700 p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
            <div className="space-y-3">
              <h3 className={`text-lg font-semibold text-white ${roboto.className}`}>{title}</h3>
              <p className={`text-sm text-neutral-400 text-justify ${roboto.className}`}>{description}</p>
            </div>

            {/* BUTTON SECTION */}
            <div className=" flex justify-center">
              <Button
                onClick={() => router.push(link)} // ✅ Navigate on click
                borderRadius="1.75rem"
                className="bg-white dark:bg-slate-900 text-black dark:text-white border-neutral-200 dark:border-slate-800"
              >
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </FocusCard>
    </li>
  );
};
