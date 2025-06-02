"use client";

import React, { useEffect, useRef, useState } from "react";
import { WavyBackground } from "@/app/components/ui/WavyBackground";

const BACKEND_URL = "http://localhost:8000"; // Change to your backend URL
type Face = [number, number, number, number]; // [x, y, width, height]

const VisualEmotion = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [webcamOn, setWebcamOn] = useState<boolean>(false);
  const [facesEmotions, setFacesEmotions] = useState<string[]>([]); // Store the emotions for each face
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null); // For managing the interval

  const startWebcam = async () => {
    try {
      // Check if the webcam is already running and stop it first
      if (streamRef.current) {
        stopWebcam();  // Stop the existing webcam session before starting a new one
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

  const stopWebcam = () => {
    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  
    // Stop the video element from playing
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Clear the canvas when webcam is off
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height); // Clear any bounding boxes
    }

    // Stop sending frames by clearing the interval
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null); // Reset the interval state
    }

    // Reset webcam state
    setWebcamOn(false);
  };
  
  const toggleWebcam = () => {
    if (webcamOn) {
      stopWebcam();
    } else {
      setFacesEmotions([]); // Reset any previous emotions when starting fresh
      startWebcam();
    }
  };

  // Capture frame and send to backend (visual emotion processing)
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
          // Prepare FormData to send only the frame (image) to the backend
          const formData = new FormData();
          formData.append("image", frameBlob, "frame.jpg");

          // Send the frame to the backend for emotion prediction
          try {
            const response = await fetch(`${BACKEND_URL}/visualemotion/`, {
              method: "POST",
              body: formData,
            });
            const data = await response.json();
            if (data.faces) {
              drawBoundingBoxes(data.faces, data.faces_emotions); // Draw the bounding boxes with emotions
              setFacesEmotions(data.faces_emotions); // Save emotions for faces
            }
            console.log("Visual emotion processing result:", data);
          } catch (error) {
            console.error("Error sending visual data to backend:", error);
          }
        }
      }, "image/jpeg");
    }
  };

  useEffect(() => {
    // If webcam is on, start sending frames every 5 seconds
    if (webcamOn) {
      const interval = setInterval(() => {
        captureAndSendFrame(); // Capture and send video frames
      }, 5000); // Capture and send every 5 seconds
      setIntervalId(interval); // Save the interval ID to clear it later
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Clean up the interval on unmount
      }
    };
  }, [webcamOn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const drawBoundingBoxes = (faces: Face[], emotions: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Ensure the canvas element is available

    const context = canvas.getContext("2d");
    if (!context) return; // Ensure the context is available

    // Clear the previous bounding boxes
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw new bounding boxes with emotions
    faces.forEach(([x, y, w, h], index) => {
      context.beginPath();
      context.rect(x, y, w, h);  // Draw the face box
      context.lineWidth = 2;
      context.strokeStyle = "red";
      context.fillStyle = "red";
      context.stroke();

      // Draw the emotion text at the bottom-right corner of the bounding box
      const emotion = emotions[index];
      context.font = "16px Arial";
      context.fillStyle = "yellow";
      context.fillText(emotion, x , y + h);  // Position the emotion text
    });
  };

  return (
    <WavyBackground>
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-lg border border-gray-500 w-[640px] h-[480px]"        
      />

      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="rounded-lg border flex flex-col items-center justify-center"
        style={{ position: "absolute", top: 16, left: 17, zIndex: 10 }}
      />

      <div className="flex flex-wrap gap-4 mt-6">
        <button
          onClick={toggleWebcam}
          className={`px-4 py-2 rounded transition ${
            webcamOn ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {webcamOn ? "Turn Off Webcam" : "Turn On Webcam"}
        </button>
      </div>
    </div>
    </WavyBackground>
  );
};

export default VisualEmotion;
