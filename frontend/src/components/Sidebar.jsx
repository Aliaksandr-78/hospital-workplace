import PropTypes from "prop-types";
import { useUI } from "../context/UIContext";
import Button from "./Button";
import { Link } from "react-router-dom";

const Sidebar = ({ links }) => {
  const { isSidebarOpen, openSidebar, closeSidebar } = useUI();

  return (
    <>
      <Button onClick={openSidebar} className="text-xl sm:text-2xl p-1 sm:p-2">
        ☰
      </Button>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      >
        <div
          className={`fixed top-0 left-0 h-full w-56 sm:w-64 bg-gray-800 text-white z-50 shadow-lg p-3 sm:p-4 transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onMouseLeave={closeSidebar}
        >
          <nav className="mt-10 sm:mt-12 h-[calc(100%-2.5rem)] overflow-y-auto custom-scrollbar">
            <ul>
              {links.map((link, index) => (
                <li key={index} className="hover:bg-gray-700 cursor-pointer">
                  <Link
                    to={link.path}
                    onClick={closeSidebar}
                    className="block px-4 py-2 sm:px-6 sm:py-3 w-full h-full text-sm sm:text-base"
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