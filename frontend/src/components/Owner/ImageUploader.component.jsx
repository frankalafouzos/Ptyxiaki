import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Row, Col } from 'react-bootstrap';
import DraggableImage from './DraggableImage.component';
import styles from '../../css/ImageUploader.module.css';

const ImageUploader = ({ setImages, initialImages = [], onExistingImageRemoved }) => {
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    setExistingImages(initialImages.map(image => ({
      ...image,
      src: image.link // Assuming the fetched images have a 'link' field
    })));
  }, [initialImages]);

  const moveImage = (fromIndex, toIndex, type) => {
    let updatedImages = [];
    if (type === 'existing') {
      updatedImages = Array.from(existingImages);
    } else {
      updatedImages = Array.from(newImages);
    }
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    if (type === 'existing') {
      setExistingImages(updatedImages);
    } else {
      setNewImages(updatedImages);
    }
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
        files.map((file, index) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({ id: `${file.name}-${index}-${Date.now()}`, src: reader.result, file });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      ).then((newImages) => {
        setNewImages((prevImages) => [...prevImages, ...newImages]);
        setImages((prevImages) => [...prevImages, ...newImages.map(image => image.file)]);
      });
    };
    fileInput.click();
  };

  const removeImage = (index, type) => {
    if (type === 'existing') {
      console.log("1");
      const removedImage = existingImages[index]; // Get the image before filtering
      console.log("2");
      // Update the existingImages state
      setExistingImages(prevImages => {
        return prevImages.filter((_, i) => i !== index);
      });
      console.log("3");
      // Notify parent about the deletion
      if (onExistingImageRemoved) {
        onExistingImageRemoved(removedImage);
      }
      console.log("4");
    } else {
      const updatedImages = newImages.filter((_, i) => i !== index);
      setNewImages(updatedImages);
      setImages(updatedImages.map(image => image.file));
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.imageUploaderContainer}>
        <button onClick={handleAddImages} className="btn btn-primary mb-3">
          Add Image
        </button>
        <Row className={styles.imageRow}>
          {existingImages.map((image, index) => (
            <Col key={image.id} xs={12} sm={6} md={4} lg={4} className="mb-3">
              <DraggableImage
                image={image}
                index={index}
                moveImage={(fromIndex, toIndex) => moveImage(fromIndex, toIndex, 'existing')}
                removeImage={() => removeImage(index, 'existing')}
              />
            </Col>
          ))}
          {newImages.map((image, index) => (
            <Col key={image.id} xs={12} sm={6} md={4} lg={4} className="mb-3">
              <DraggableImage
                image={image}
                index={index}
                moveImage={(fromIndex, toIndex) => moveImage(fromIndex, toIndex, 'new')}
                removeImage={() => removeImage(index, 'new')}
              />
            </Col>
          ))}
        </Row>
      </div>
    </DndProvider>
  );
};

export default ImageUploader;
