import Webcam from "react-webcam";
import { useRef } from "react";

const CustomWebcam = () => {
  const webcamRef = useRef(null);

  return (
    <div className="container">
      <Webcam
        audio={false}
        ref={webcamRef}
        width={600}
        height={600}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width: 600,
          height: 600,
          facingMode: "user",
        }}
      />
    </div>
  );
};

export default CustomWebcam;
