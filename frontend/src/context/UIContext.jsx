import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const UIContext = createContext();

/**
 * @param {Object} props - Свойства компонента.
 * @param {ReactNode} props.children - Дочерние элементы.
 * @returns {JSX.Element} - JSX элемент провайдера.
 */
export const UIProvider = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Состояние сайдбара
  const [modal, setModal] = useState({ isOpen: false, content: null, props: {} });
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // Состояние меню профиля

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);
  const closeProfileMenu = () => setProfileMenuOpen(false);

  /**
   * @param {ReactNode} content - Контент модального окна.
   * @param {Object} props - Дополнительные свойства модального окна (например, заголовок, размер).
   */
  const openModal = (content, props = {}) => setModal({ isOpen: true, content, props });
  const closeModal = () => setModal({ isOpen: false, content: null, props: {} });

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        modal,
        openModal,
        closeModal,
        profileMenuOpen,
        toggleProfileMenu,
        closeProfileMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

UIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * @returns {Object} - Значение контекста UI.
 */
export const useUI = () => useContext(UIContext);

export default UIContext;