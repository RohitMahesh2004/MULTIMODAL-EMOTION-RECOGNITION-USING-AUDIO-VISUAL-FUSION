import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import cv2

# Load the pre-trained emotion detection model and label encoder
image_model = load_model('Image-Classifiaction.keras')
label_encoder = LabelEncoder()
label_encoder.fit(["angry", "calm", "disgust", "fearful", "happy", "neutral", "sad", "surprised"])

def preprocess_image(face_image: np.ndarray, target_size=(64, 64)):
    img_resized = cv2.resize(face_image, target_size)
    img_resized = img_resized / 255.0
    img_array = np.array(img_resized)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

def predict_image_emotion(face_image: np.ndarray):
    """
    Predict the emotion of a face image using the pre-trained model.
    """
    # Preprocess the image
    img_array = preprocess_image(face_image)
    
    # Predict the emotion using the image model
    predictions = image_model.predict(img_array)
    
    # Get the emotion with the highest prediction probability
    emotion_label = np.argmax(predictions, axis=1)[0]
    
    # Convert the label to the corresponding emotion
    emotion = label_encoder.inverse_transform([emotion_label])[0]

    frame_confidence = np.mean(np.max(predictions, axis=1))
    
    return emotion,frame_confidence
