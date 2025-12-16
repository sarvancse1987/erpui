import Webcam from "react-webcam";
import { useRef, useState, useCallback } from "react";
import { Button } from "primereact/button";

interface CustomWebcamProps {
    onCapture: (img: string) => void;
}

const CustomWebcam = ({ onCapture }: CustomWebcamProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [image, setImage] = useState<string | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const img = webcamRef.current.getScreenshot();
            if (img) {
                setImage(img);
                onCapture(img); // send image to parent
            }
        }
    }, [onCapture]);

    const retake = () => {
        setImage(null);
    };

    return (
        <div className="flex flex-col items-center p-1 space-y-3">

            {/* ----------- CAMERA VIEW ----------- */}
            {!image && (
                <>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width={180}
                        height={180}
                        videoConstraints={{
                            width: 640,
                            height: 640,
                            facingMode: "user"
                        }}
                        className="rounded-lg shadow-md"
                    />

                    <Button
                        label="Capture"
                        icon="pi pi-camera"
                        onClick={capture}
                        severity="info"
                        className="p-button-sm"
                    />
                </>
            )}

            {/* ----------- PREVIEW VIEW ----------- */}
            {image && (
                <>
                    <img
                        src={image}
                        alt="Captured"
                        className="w-40 h-40 rounded-lg shadow-md"
                    />

                    <Button
                        label="Retake"
                        icon="pi pi-refresh"
                        severity="secondary"
                        onClick={retake}
                        className="p-button-sm"
                    />
                </>
            )}

        </div>
    );
};

export default CustomWebcam;
