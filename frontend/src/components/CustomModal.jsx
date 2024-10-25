import React, { useEffect, useState } from 'react';
import '../css/CustomModal.css'; // Import custom CSS for styling
import { Button } from 'react-bootstrap'; // Using Bootstrap buttons

const CustomModal = ({ 
  show, 
  handleClose, 
  handleDelete, 
  title="Confirm Action User", // Default modal title
  body="Are you sure you want to perform this action?", // Default modal body
  cancelLabel = "Cancel", // Default cancel button label
  confirmLabel = "Confirm", // Default confirm button label
  isWarning = false // Default to false for normal confirmations
}) => {
  const [closing, setClosing] = useState(false); // State to manage close animation
  const [isVisible, setIsVisible] = useState(show); // State to manage modal visibility

  // Handle modal close
  const handleModalClose = () => {
    setClosing(true); // Trigger the closing animation
    setTimeout(() => {
      setIsVisible(false); // Remove the modal from the DOM after the animation
      handleClose(); // Call the parent close function
    }, 500); // Match the duration of the close animation
  };

  // Effect to reset closing state when modal is opened
  useEffect(() => {
    if (show) {
      setClosing(false); // Reset closing state when modal opens
      setIsVisible(true); // Set modal to visible
    }
  }, [show]);

  // If modal is not visible, return null
  if (!isVisible) return null; 

  return (
    <div className={`custom-modal-overlay ${closing ? 'custom-modal-overlay-close' : ''}`}>
      <div className={`custom-modal ${closing ? 'custom-modal-close-transition' : ''}`}>
        <div className="custom-modal-header">
          <h5 className="custom-modal-title">{title}</h5>  {/* Dynamic Modal Title */}
          <button className="custom-modal-close" onClick={handleModalClose}>
            &times;
          </button>
        </div>
        <div className="custom-modal-body">
          {body} {/* Dynamic Modal Body */}
        </div>
        <div className="custom-modal-footer">
          <Button variant="secondary" onClick={handleModalClose}>
            {cancelLabel} {/* Dynamic Cancel Button Label */}
          </Button>
          <Button variant={isWarning ? 'warning' : 'danger'} onClick={handleDelete}>
            {confirmLabel} {/* Dynamic Confirm Button Label */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;