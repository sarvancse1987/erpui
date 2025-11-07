import { useState, useRef } from "react";
import { FileUpload } from "primereact/fileupload";
import DefaultIcon from "../../src/Images/ImageDefaultIcon.png";

interface TImageUploadProps {
  id: string;
  imageSrc?: string;
  onImageChange: (base64Image: string) => void;
}

export const TImageUpload = ({ id, imageSrc, onImageChange }: TImageUploadProps) => {
  const [preview, setPreview] = useState<string>(imageSrc || DefaultIcon);
  const fileUploadWrapperRef = useRef<HTMLDivElement>(null);

  const onSelectHandler = (event: any) => {
    const file = event.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setPreview(base64Image);
        onImageChange(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFileDialog = () => {
    if (fileUploadWrapperRef.current) {
      const fileInput = fileUploadWrapperRef.current.querySelector('input[type="file"]') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.click();
      }
    }
  };

  return (
    <div className="col-lg-4 col-md-12 col-sm-12 col-12 mt-2 mb-2 d-flex justify-content-center picbox imageup">
      <div
        className="picture"
        onClick={openFileDialog}
        tabIndex={0}
        style={{ cursor: "pointer" }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            openFileDialog();
          }
        }}
        aria-label="Upload image"
        role="button"
      >
        <img
          className={`imagePreview-${id}`}
          src={preview}
          alt="Upload"
          style={{
            width: "70px",
            height: "70px",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      </div>

      <div ref={fileUploadWrapperRef} style={{ display: "none" }}>
        <FileUpload
          name="demo[]"
          accept="image/*"
          maxFileSize={1000000}
          auto={false} // disable auto upload to handle it manually
          customUpload={true}
          multiple={false}
          chooseLabel=""
          uploadHandler={() => {}} // not used
          onSelect={onSelectHandler} // files are accessible here
        />
      </div>
    </div>
  );
};
