import React from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import Button from "./Button";

const DeleteConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
}) => {
  return (
    <Modal show={show} onClose={onClose} title={title} size="md">
      <div className="text-center mb-4">
        <div className="alert-icon mb-3">
          <i
            className="bi bi-exclamation-triangle-fill text-danger"
            style={{ fontSize: "3rem" }}
          ></i>
        </div>
        <p>{message}</p>
      </div>
      <div className="d-flex justify-content-center gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

DeleteConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
};

export default DeleteConfirmationModal;
