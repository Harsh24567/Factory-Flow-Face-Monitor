import cv2
import logging
import time

logger = logging.getLogger(__name__)

class CameraManager:
    def __init__(self, camera_index=0, width=640, height=480):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.cap = None

    def start(self):
        logger.info("Starting camera...")
        self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)

        if not self.cap.isOpened():
            raise RuntimeError("Camera could not be opened")

        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)

    def read(self):
        if self.cap is None:
            return None

        ret, frame = self.cap.read()
        if not ret:
            logger.warning("Camera frame read failed")
            return None

        return frame

    def stop(self):
        if self.cap:
            self.cap.release()
            logger.info("Camera released")
