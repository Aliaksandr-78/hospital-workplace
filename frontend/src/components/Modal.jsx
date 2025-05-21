import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;