import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from '../../css/ImageUploader.module.css'; // Ensure you have the correct path to your CSS file

const DraggableImage = ({ image, index, moveImage, removeImage }) => {
  const [, ref] = useDrag({
    type: 'image',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div style={{
      width: '100%',
      display: 'flex',
    }}><div
      ref={(node) => ref(drop(node))}
      style={{
        position: 'relative',
        padding: '5px',
        width: '100% !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: '#f8f8f8',
      }}
    >
      <img
        src={image.src}
        alt={`Image ${index}`}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'cover',
          borderRadius: '4px',
        }}
      />
      <button
        onClick={() => removeImage(index)}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          transition: 'background 0.3s ease',
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </div>
    </div>
  );
};

export default DraggableImage;
