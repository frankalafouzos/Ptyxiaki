import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";

const ViewOfferButton = ({ offerId, buttonText = "View Offer", variant = "info", size = "sm" }) => {
  const [show, setShow] = useState(false);
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShow = async () => {
    setLoading(true);
    setShow(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/offers/getOffer/${offerId}`);
      const data = await res.json();
      setOffer(data);
    } catch (err) {
      setOffer(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setOffer(null);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={handleShow} disabled={!offerId}>
        {buttonText}
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Offer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div>Loading...</div>
          ) : offer ? (
            <div>
              <div>
                <strong>Title:</strong> {offer.title}
              </div>
              <div>
                <strong>Description:</strong> {offer.description}
              </div>
              <div>
                <strong>Discount:</strong>{" "}
                {offer.discountType === "percentage"
                  ? `${offer.discountValue}%`
                  : `€${offer.discountValue}`}
              </div>
              <div>
                <strong>Valid:</strong>{" "}
                {offer.startDate
                  ? `${new Date(offer.startDate).toLocaleDateString()}`
                  : "N/A"}{" "}
                -{" "}
                {offer.endDate
                  ? `${new Date(offer.endDate).toLocaleDateString()}`
                  : "N/A"}
              </div>
            </div>
          ) : (
            <div>No offer details available.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ViewOfferButton;