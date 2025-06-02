"use client";

import React, { useState } from "react";
import { WavyBackground } from "@/app/components/ui/WavyBackground"; // Import WavyBackground component
import { orbitron } from '@/lib/font';

const AudioPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultText, setResultText] = useState("");
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);

  // Start recording handler
  const startRecording = async () => {
    setIsProcessing(true);
    setResultText("Processing... Please wait.");

    try {
      // Call backend to process audio
      const response = await fetch("http://localhost:8000/process_audio/", {
        method: "POST",
      });

      const data = await response.json();
      console.log("Audio Processing Result:", data);

      if (data.audio_emotion) {
        setResultText(`Predicted Emotion: ${data.audio_emotion}`);  // Display the emotion prediction
      } else {
        setResultText("No emotion detected.");
      }
    } catch (error) {
      console.error("Error sending audio:", error);
      setResultText("An error occurred while processing the audio.");
    } finally {
      setIsProcessing(false);
      setIsRecordingComplete(true);  // Mark the process as complete
    }
  };

  return (
    <div className="w-full h-screen relative">
      <WavyBackground className={`w-full h-full ${isProcessing ? "waving-background" : ""}`}>
        {/* Text Section */}
        <div className="relative z-10 text-center text-white font-sans pt-[22vh] pb-[12vh]">
          <p className={`text-4xl md:text-5xl font-bold leading-tight ${orbitron.className}`}>Audio Emotion Recognition</p>
          <p className="text-lg md:text-xl mt-2 text-neutral-300">
            Recognizing emotions through audio input
          </p>
        </div>

        {/* Start Recording Button */}
        <div className="absolute bottom-50 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={startRecording}
            disabled={isProcessing}  // Disable the button while processing
            className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
              isProcessing ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isProcessing ? "Processing..." : "Start Recording"}
          </button>
        </div>

        {/* Display Result */}
        <div className={`absolute bottom-35 left-1/2 transform -translate-x-1/2 text-center text-white ${orbitron.className}`}>
          {isRecordingComplete && <p className="text-xl font-bold">{resultText}</p>}
        </div>
      </WavyBackground>
    </div>
  );
};

export default AudioPage;
