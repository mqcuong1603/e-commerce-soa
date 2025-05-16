import React, { useEffect } from "react";
import PropTypes from "prop-types";

/**
 * Reusable Modal component using Bootstrap's modal
 */
const Modal = ({
  show,
  onClose,
  title,
  children,
  size = "md",
  centered = true,
}) => {
  useEffect(() => {
    // Prevent body scrolling when modal is open
    if (show) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "17px";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [show]);

  if (!show) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      >
        <div
          className={`modal-dialog modal-${size} ${
            centered ? "modal-dialog-centered" : ""
          }`}
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
  centered: PropTypes.bool,
};

export default Modal;
