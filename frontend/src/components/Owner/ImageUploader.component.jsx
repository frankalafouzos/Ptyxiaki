import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Row, Col } from 'react-bootstrap';
import DraggableImage from './DraggableImage.component'; // Ensure you have the correct path to this file
import styles from '../../css/ImageUploader.module.css'; // Ensure you have the correct path to your CSS file

const ImageUploader = () => {
  const [images, setImages] = useState([]);

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = Array.from(images);
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);
  };

  const handleAddImages = (event) => {
    event.preventDefault();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = Array.from(e.target.files);
      Promise.all(
        files.map((file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ id: `image-${images.length + 1}`, src: reader.result });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      ).then((newImages) => {
        setImages((prevImages) => [...prevImages, ...newImages]);
      });
    };
    fileInput.click();
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <button onClick={handleAddImages} className="btn btn-primary mb-3">
          Add Image
        </button>
        <Row
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            margin: '0',
            padding: '0',
          }}
        >
          {images.map((image, index) => (
            <Col key={image.id} xs={12} sm={6} md={4} lg={4} className="mb-3">
              <DraggableImage
                image={image}
                index={index}
                moveImage={moveImage}
                removeImage={removeImage}
              />
            </Col>
          ))}
        </Row>
      </div>
    </DndProvider>
  );
};

export default ImageUploader;
