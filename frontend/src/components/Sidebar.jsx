import PropTypes from "prop-types";
import { useUI } from "../context/UIContext";
import Button from "./Button";
import { Link } from "react-router-dom";

/**
 * @param {Object} props - Свойства компонента.
 * @param {Array} props.links - Массив ссылок для отображения в сайдбаре.
 * @returns {JSX.Element} - JSX элемент сайдбара.
 */
const Sidebar = ({ links }) => {
  const { isSidebarOpen, openSidebar, closeSidebar } = useUI();

  return (
    <>
      <Button onClick={openSidebar} className="text-2xl p-2">
        ☰
      </Button>

      {/* Сайдбар */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar} // Закрыть сайдбар при клике вне его области
      >
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 shadow-lg p-4 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onMouseLeave={closeSidebar} // Закрыть сайдбар при уходе курсора
        >
          {/* Навигация */}
          <nav className="mt-12 h-[calc(100%-3rem)] overflow-y-auto custom-scrollbar">
            <ul>
              {links.map((link, index) => (
                <li key={index} className="hover:bg-gray-700 cursor-pointer">
                  {/* Обернули весь элемент <li> в <Link> */}
                  <Link
                    to={link.path}
                    onClick={closeSidebar}
                    className="block px-6 py-3 w-full h-full"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  links: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Sidebar;