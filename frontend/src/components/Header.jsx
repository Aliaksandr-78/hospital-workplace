import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import Sidebar from "./Sidebar";
import Button from "./Button";

/**
 * @param {Object} props - Свойства компонента.
 * @param {string} props.appName - Название приложения.
 * @returns {JSX.Element} - JSX элемент шапки.
 */
const Header = ({ appName }) => {
  const { user, logout } = useAuth();
  const { profileMenuOpen, toggleProfileMenu, closeProfileMenu } = useUI();

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
      <Sidebar
        links={[
          { path: "/main", label: "Главная" },
          { path: "/manage-users", label: "Пользователи"},
          { path: "/admindashboard", label: "Панель администратора"},
          { path: "/patients", label: "Менеджер пациентов"},
          { path: "/manage-services", label: "Менеджер услуг"},
          { path: "/manage-roles", label: "Менеджер ролей"},
          { path: "/manage-specialties", label: "Менеджер специальностей"},
          { path: "/manage-medications", label: "Менеджер медикаментов"},
          { path: "/manage-lab-tests", label: "Менеджер лаб. тесты"},
          { path: "/manage-document-templates", label: "Менеджер документации"},
          { path: "/manage-eventtypes", label: "Менеджер типов событий"},
          { path: "/manage-schedules", label: "Менеджер расписания"},
          { path: "/appointments", label: "Менеджер приемов"},
          { path: "/consent-forms", label: "Управление согласиями"},
          { path: "/medical-certificates", label: "Менеджер справок"},
          { path: "/medical-discharges", label: "Управление выписками"},
          { path: "/medical-records", label: "Управление медицинскими картами"},
          { path: "/manage-diagnosis", label: "Менеджер диагнозов"}
        ]}  
      />

      <h1 className="text-lg font-semibold">{appName}</h1>

      {/* Профиль пользователя */}
      <div className="relative flex items-center">
        {user && (
          <span className="mr-4">
            {user.firstname} {user.middlename} {user.lastname}
          </span>
        )}
        <Button
          onClick={toggleProfileMenu}
          className="p-2 rounded-full bg-gray-800"
          aria-label="Открыть меню профиля"
        >
          ⚙
        </Button>

        {/* Меню профиля */}
        {profileMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg py-2 z-50 animate-fade-in"
            onMouseLeave={closeProfileMenu} // Закрыть меню при уходе курсора
          >
            {user && (
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200 transition-colors"
              >
                Выйти
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  appName: PropTypes.string.isRequired,
};

export default Header;