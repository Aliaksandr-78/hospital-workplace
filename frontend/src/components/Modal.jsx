import PropTypes from "prop-types";

/**
 * @param {Object} props - Свойства компонента.
 * @param {boolean} props.isOpen - Открыто ли модальное окно.
 * @param {function} props.onClose - Функция для закрытия модального окна.
 * @param {ReactNode} props.children - Дочерние элементы.
 * @returns {JSX.Element} - JSX элемент модального окна.
 */
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
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