import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import { useUI } from "../context/UIContext";
import Sidebar from "./Sidebar";
import Button from "./Button";
import { useEffect, useState } from "react";
import { getAllRoles } from "../api/roleApi";
import { getUserRolesByUserId } from "../api/userRoleApi";

/**
 * @param {Object} props - Свойства компонента.
 * @param {string} props.appName - Название приложения.
 * @returns {JSX.Element} - JSX элемент шапки.
 */
const Header = ({ appName }) => {
  const { user, logout } = useAuth();
  const { profileMenuOpen, toggleProfileMenu, closeProfileMenu } = useUI();
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка ролей пользователя
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (user?.userid) {
        try {
          const rolesData = await getAllRoles();
          setAllRoles(rolesData);
          
          const userRolesData = await getUserRolesByUserId(user.userid);
          setUserRoles(userRolesData);
        } catch (error) {
          console.error("Ошибка при загрузке ролей:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserRoles();
  }, [user?.userid]);

  // Получение названий ролей пользователя
  const getUserRoleNames = () => {
    return userRoles
      .map((userRole) => {
        const role = allRoles.find((role) => role.roleid === userRole.roleid);
        return role ? role.rolename : null;
      })
      .filter(Boolean);
  };

  // Все возможные ссылки
  const allLinks = [
    { path: "/main", label: "Главная", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/manage-users", label: "Пользователи", roles: ["Admin"] },
    { path: "/manage-roles", label: "Роли", roles: ["Admin"] },
    { path: "/manage-specialties", label: "Специальности", roles: ["Admin"] },
    { path: "/manage-eventtypes", label: "Типы работы", roles: ["Admin"] },


    { path: "/patients", label: "Пациенты", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/medical-records", label: "Медицинские карты", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/manage-diagnosis", label: "Диагнозы", roles: ["Admin", "Doctor"] },
    { path: "/manage-medications", label: "Медикаменты", roles: ["Admin", "Doctor"] },
    { path: "/manage-services", label: "Услуги", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/manage-document-templates", label: "Документация", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/manage-schedules", label: "График работы", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/appointments", label: "Менеджер приемов", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/consent-forms", label: "Согласия", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/medical-certificates", label: "Справки", roles: ["Admin", "Doctor", "Nurse"] },
    { path: "/medical-discharges", label: "Выписки", roles: ["Admin", "Doctor", "Nurse"] },
  ];

  // Фильтрация ссылок по ролям пользователя
  const getFilteredLinks = () => {
    if (loading) return [];
    
    const userRoleNames = getUserRoleNames();
    
    // Если пользователь админ, показываем все ссылки
    if (userRoleNames.includes("Admin")) {
      return allLinks;
    }
    
    // Фильтруем ссылки для врача и медсестры
    return allLinks.filter(link => {
      // Если у ссылки нет ограничений по ролям, показываем всем
      if (!link.roles || link.roles.length === 0) return true;
      
      // Проверяем, есть ли у пользователя хотя бы одна из требуемых ролей
      return link.roles.some(role => userRoleNames.includes(role));
    });
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
      <Sidebar links={getFilteredLinks()} />

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
            onMouseLeave={closeProfileMenu}
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