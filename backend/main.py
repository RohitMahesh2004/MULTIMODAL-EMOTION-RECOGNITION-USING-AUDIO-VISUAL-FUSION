from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from face_detection import detect_faces
from audio_emotion import predict_audio_emotion
from PIL import Image
from image_emotion import predict_image_emotion
import io
import numpy as np
import sounddevice as sd
import soundfile as sf
import tempfile
from fastapi.middleware.cors import CORSMiddleware
import os
import cv2


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
RECORD_SECONDS = 4  # Audio recording duration in seconds
AUDIO_SAVE_PATH = "saved_audio"  # Directory to save the audio files

# Ensure the save directory exists
if not os.path.exists(AUDIO_SAVE_PATH):
    os.makedirs(AUDIO_SAVE_PATH)

def save_cropped_face(face_img: np.ndarray, filename: str):
    # Convert the NumPy array (OpenCV format) to PIL image
    pil_image = Image.fromarray(cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB))  # Convert from BGR to RGB
    
    # Ensure the directory exists
    if not os.path.exists('cropped_faces'):
        os.makedirs('cropped_faces')
    
    # Save the image locally
    pil_image.save(os.path.join('cropped_faces', filename))  # Save using PIL Image's .save() method


@app.post("/visualemotion/")
async def visualemotion(image: UploadFile = File(...)):
    try:
        # Process the image
        image_bytes = await image.read()
        faces = detect_faces(image_bytes)
        print(f"Faces detected: {faces}")
        
        # Convert faces to list
        faces_list = faces.tolist() if hasattr(faces, 'tolist') else faces

        if len(faces_list) == 0:
            return JSONResponse(content={"message": "No faces detected in the image."}, status_code=200)

        # Predict the emotion from the faces in the image
        emotions_from_faces = []
        confidence1=[]
        for (x, y, w, h) in faces_list:
            face_img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            print(face_img.shape)
            x = max(0, x)  # If x is less than 0, set it to 0
            y = max(0, y)  # If y is less than 0, set it to 0
            x_end = min(x + w, face_img.shape[1])  # Ensure the right edge doesn't go beyond the image width
            y_end = min(y + h, face_img.shape[0]) 
            save_cropped_face(face_img, f"face_{x}_{y}.jpg")
            face_emotion,confidence = predict_image_emotion(face_img)
            print(face_emotion)
            emotions_from_faces.append(face_emotion)
            confidence1.append(confidence)

        confidence1 = [float(conf) for conf in confidence1] 

        return JSONResponse(content={
            "message": "Visual emotion processing successful!",
            "faces": faces_list,
            "faces_emotions": emotions_from_faces,
            "confidence":confidence1

        }, status_code=200)

    except Exception as e:
        print(f"Error processing frames: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)
# Endpoint for processing audio
@app.post("/process_audio/")
async def process_audio():
    try:
        # Record audio on the server (ignore the audio sent by the frontend)
        fs = 48000  # Sample rate for recording
        print("[INFO] Recording audio...")
        audio = sd.rec(int(RECORD_SECONDS * fs), samplerate=fs, channels=1)  # Record audio
        sd.wait()  # Wait until recording is finished
        
        # Save the recorded audio to a temporary file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, audio, fs)
            tmp_path = tmp.name

        filename = os.path.join(AUDIO_SAVE_PATH, "recorded_audio.wav")
        sf.write(filename, audio, fs)
        audio_features,confidence = predict_audio_emotion(tmp_path)
        confidence=float(confidence)
        return JSONResponse(content={
            "message": "Audio processing successful!",
            "audio_emotion": audio_features,
            "confidence":confidence
        }, status_code=200)

    except Exception as e:
        print(f"Error processing audio: {e}")
        return JSONResponse(content={"message": str(e)}, status_code=500)
