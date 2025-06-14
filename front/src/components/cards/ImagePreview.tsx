import React, { useState } from "react";

type ImagePreviewProps = {
  image: File | undefined;
  index: number;
};

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, index }) => {
  return (
    <div>
      {image && (
        <img
          key={index}
          src={URL.createObjectURL(image)}
          /* консп */
          alt={`preview ${index}`}
          width={50}
        />
      )}
    </div>
  );
};

export default ImagePreview;
