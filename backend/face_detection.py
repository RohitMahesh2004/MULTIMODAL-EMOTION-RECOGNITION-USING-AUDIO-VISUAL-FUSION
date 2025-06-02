import numpy as np
from mtcnn import MTCNN
import cv2
from typing import List, Tuple
import io

# Initialize MTCNN face detector
def load_mcnn_model():
    detector = MTCNN()  # MTCNN is a pre-trained face detector
    return detector

# MCNN-based face/person detection function
def detect_faces(image_bytes: bytes) -> List[Tuple[int, int, int, int]]:
    # Convert the byte image into a numpy array and decode it into an OpenCV image
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Load the MTCNN face detector
    detector = load_mcnn_model()

    # Detect faces using MTCNN
    results = detector.detect_faces(image)

    faces = []
    for result in results:
        # Extract the bounding box from the result
        x, y, w, h = result['box']
        
        # Append the coordinates of the face (left, top, width, height)
        faces.append((x-80, y-80, w+150, h+100))

    return faces
