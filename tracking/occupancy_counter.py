import cv2
import time


class OccupancyCounter:
    def __init__(self, model_path, config_path, confidence_threshold=0.5, process_interval=1.0):
        self.net = cv2.dnn.readNetFromCaffe(config_path, model_path)
        self.confidence_threshold = confidence_threshold
        self.process_interval = process_interval
        self.last_process_time = 0
        self.current_count = 0

    def count_people(self, frame):
        current_time = time.time()

        # Run detection only at interval
        if current_time - self.last_process_time < self.process_interval:
            return self.current_count

        self.last_process_time = current_time

        (h, w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            0.007843,
            (300, 300),
            127.5
        )

        self.net.setInput(blob)
        detections = self.net.forward()

        count = 0

        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]

            if confidence > self.confidence_threshold:
                class_id = int(detections[0, 0, i, 1])

                # class_id 15 = person in MobileNet-SSD
                if class_id == 15:
                    count += 1

        self.current_count = count
        return count
