"use client";

import React, { useEffect, useRef, useState } from "react";
import { orbitron } from '@/lib/font';
import { WavyBackground } from "@/app/components/ui/WavyBackground";

const BACKEND_URL = "http://localhost:8000"; // Change to your backend URL

const MultimodalEmotion = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEmotion, setAudioEmotion] = useState("");
  const [visualEmotion, setVisualEmotion] = useState("");
  const [audioConfidence, setAudioConfidence] = useState(0);
  const [visualConfidence, setVisualConfidence] = useState(0);
  const [webcamOn, setWebcamOn] = useState(false);
  const [combinedEmotion, setCombinedEmotion] = useState("");

  // Start/Stop recording handler
  const toggleWebcam = async () => {
    if (webcamOn) {
      stopWebcam();
    } else {
      setVisualEmotion(""); // Reset visual emotion when starting fresh
      startWebcam();
    }
  };

  // Start webcam
  const startWebcam = async () => {
    try {
      // Check if the webcam is already running and stop it first
      if (streamRef.current) {
        stopWebcam(); // Stop the existing webcam session before starting a new one
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // No audio recording
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setWebcamOn(true);
    } catch (err) {
      console.error("Error accessing webcam:", err);
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setWebcamOn(false);
  };

  // Capture and send frame to the backend for visual emotion processing
  const captureAndSendFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Convert the frame to a Blob (image/jpeg)
      canvas.toBlob(async (frameBlob) => {
        if (frameBlob) {
          const formData = new FormData();
          formData.append("image", frameBlob, "frame.jpg");

          try {
            const response = await fetch(`${BACKEND_URL}/visualemotion/`, {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            if (data.faces_emotions) {
              setVisualEmotion(data.faces_emotions.join(", "));
              setVisualConfidence(Math.max(...data.confidence)); // Assuming `confidence` is returned as an array
            }
          } catch (error) {
            console.error("Error sending visual data to backend:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  // Call backend for audio emotion processing
  const processAudio = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/process_audio/`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.audio_emotion) {
        setAudioEmotion(data.audio_emotion); // Set the audio emotion
        setAudioConfidence(data.confidence); // Set the audio confidence
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
    }
  };

  // Start both audio and visual emotion detection
  const startBothProcessing = async () => {
    // Start capturing visual emotion from webcam
    captureAndSendFrame();

    // Process audio recognition from backend
    processAudio();
  };

  useEffect(() => {
    if (webcamOn) {
      const interval = setInterval(() => {
        captureAndSendFrame();
      }, 5000); // Capture and send every 5 seconds

      return () => clearInterval(interval);
    }
  }, [webcamOn]);

  useEffect(() => {
    if (audioEmotion && visualEmotion) {
      // Calculate the combined emotion with the highest confidence
      if (audioConfidence >= visualConfidence) {
        setCombinedEmotion(audioEmotion);
      } else {
        setCombinedEmotion(visualEmotion);
      }

      stopWebcam(); // Turn off the webcam once both emotions are detected
    }
  }, [audioEmotion, visualEmotion, audioConfidence, visualConfidence]);

  return (
    <WavyBackground>
    <div className="w-full h-screen relative flex flex-col items-center justify-center bg-black">
      {/* Centered Webcam */}
      <div className="relative w-[640px] h-[480px] mb-8">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="rounded-lg border border-gray-500 w-full h-full"
        />
      </div>

      {/* Button Section */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 flex gap-4">
        {/* Button to start both emotion recognition */}
        <button
          onClick={startBothProcessing}
          disabled={isProcessing}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
            isProcessing ? "bg-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isProcessing ? "Processing..." : "Start Recognition"}
        </button>
        <button
          onClick={toggleWebcam}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
            webcamOn ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {webcamOn ? "Turn Off Webcam" : "Turn On Webcam"}
        </button>
      </div>

      {/* Displaying results */}
      <div className="absolute left-1/2 transform -translate-x-1/2 text-center text-white z-10">
        {combinedEmotion && (
          <p className={`text-4xl font-semibold text-white-500 capitalize ${orbitron.className}`}>Combined Emotion : {combinedEmotion}</p>
        )}
      </div>
    </div>
    </WavyBackground>
  );
};

export default MultimodalEmotion;
