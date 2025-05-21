import { useEffect, useState } from "react";
import {
  getAllUsers,
  registerUser,
  updateUser,
  deleteUser,
} from "../../api/userApi";
import { getAllRoles } from "../../api/roleApi";
import {
  getUserRolesByUserId,
  removeUserRole,
  updateUserRoles,
} from "../../api/userRoleApi";
import { getAllSpecialties } from "../../api/specialtyApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [userRolesMap, setUserRolesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    specialtyID: "",
    isActive: true,
    roles: [],
    password: "",
  });

  // Состояния для поиска и сортировки
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Получение ролей пользователя
  const getUserRoles = async (userid) => {
    if (!userid) {
      console.error("userid не определён");
      return [];
    }

    try {
      const userRoles = await getUserRolesByUserId(userid);
      return userRoles.map((userRole) => ({
        roleid: userRole.roleid,
        rolename: userRole.rolename || "Неизвестная роль",
      }));
    } catch (error) {
      console.error(`Ошибка при получении ролей пользователя ${userid}:`, error);
      return [];
    }
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [usersData, rolesData, specialtiesData] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllSpecialties(),
        ]);

        setUsers(usersData);
        setRoles(rolesData);
        setSpecialties(specialtiesData);

        const rolesMap = {};
        for (const user of usersData) {
          const userRoles = await getUserRoles(user.userid);
          rolesMap[user.userid] = userRoles;
        }
        setUserRolesMap(rolesMap);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Фильтрация и сортировка пользователей
  useEffect(() => {
    let result = [...users];
    
    // Фильтрация по поисковому запросу (ФИО, email)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(user => 
        `${user.firstname} ${user.middlename || ''} ${user.lastname} ${user.email}`
          .toLowerCase()
          .includes(searchLower)
      );
    }
    
    // Фильтрация по роли
    if (roleFilter) {
      result = result.filter(user => {
        const userRoles = userRolesMap[user.userid] || [];
        return userRoles.some(role => role.roleid.toString() === roleFilter);
      });
    }
    
    // Фильтрация по специальности
    if (specialtyFilter) {
      result = result.filter(user => 
        user.specialtyid && user.specialtyid.toString() === specialtyFilter
      );
    }
    
    // Сортировка
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valueA, valueB;
        
        if (sortConfig.key === 'name') {
          valueA = `${a.lastname} ${a.firstname} ${a.middlename || ''}`;
          valueB = `${b.lastname} ${b.firstname} ${b.middlename || ''}`;
        } else if (sortConfig.key === 'roles') {
          const rolesA = (userRolesMap[a.userid] || []).map(r => r.rolename).join(', ');
          const rolesB = (userRolesMap[b.userid] || []).map(r => r.rolename).join(', ');
          valueA = rolesA;
          valueB = rolesB;
        } else if (sortConfig.key === 'specialty') {
          valueA = getSpecialtyName(a.specialtyid);
          valueB = getSpecialtyName(b.specialtyid);
        } else {
          valueA = a[sortConfig.key];
          valueB = b[sortConfig.key];
        }
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredUsers(result);
  }, [users, userRolesMap, searchTerm, roleFilter, specialtyFilter, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  // Получение названия специальности по ID
  const getSpecialtyName = (specialtyid) => {
    const specialty = specialties.find((spec) => spec.specialtyid === specialtyid);
    return specialty ? specialty.specialtyname : "Не указано";
  };

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = async (user = null) => {
    if (user) {
      const userRoles = await getUserRoles(user.userid);
  
      const formattedDateOfBirth = user.dateofbirth
        ? new Date(user.dateofbirth).toLocaleDateString("en-CA")
        : "";
  
      setFormData({
        firstName: user.firstname,
        middleName: user.middlename || "",
        lastName: user.lastname,
        email: user.email,
        phoneNumber: user.phonenumber || "",
        dateOfBirth: formattedDateOfBirth,
        specialtyID: user.specialtyid || "",
        isActive: user.isactive,
        roles: userRoles.map((role) => role.roleid),
        password: "",
      });
    } else {
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        specialtyID: "",
        isActive: true,
        roles: [],
        password: "",
      });
    }
    setCurrentUser(user);
    setModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentUser(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      specialtyID: "",
      isActive: true,
      roles: [],
      password: "",
    });
  };

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    // Преобразуем дату в локальное время
    const formattedValue =
      name === "dateOfBirth" && value
        ? new Date(value).toLocaleDateString("en-CA") // Формат yyyy-MM-dd
        : value;
  
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const dataToSend = {
        ...formData,
        specialtyID: formData.specialtyID ? parseInt(formData.specialtyID, 10) : null,
        password: formData.password,
      };
  
      if (currentUser) {
        console.log(dataToSend)
        // Редактирование пользователя
        const updatedUser = await updateUser(currentUser.userid, dataToSend);
        setUsers((prev) =>
          prev.map((user) =>
            user.userid === updatedUser.userid ? updatedUser : user
          )
        );
  
        // Обновляем роли пользователя
        await updateUserRoles(currentUser.userid, formData.roles);
  
        // Обновляем роли в userRolesMap
        const updatedRoles = await getUserRoles(currentUser.userid);
        setUserRolesMap((prev) => ({
          ...prev,
          [currentUser.userid]: updatedRoles,
        }));
      } else {
        // Добавление нового пользователя
        const newUser = await registerUser(dataToSend);
        setUsers((prev) => [...prev, newUser]);
  
        // Назначаем роли пользователя
        if (formData.roles && formData.roles.length > 0) {
          await updateUserRoles(newUser.userid, formData.roles);
        }
  
        // Обновляем роли в userRolesMap
        const updatedRoles = await getUserRoles(newUser.userid);
        setUserRolesMap((prev) => ({
          ...prev,
          [newUser.userid]: updatedRoles,
        }));
      }
      closeModal(); // Закрываем модальное окно после успешного сохранения
    } catch (error) {
      console.error("Ошибка при сохранении пользователя:", error);
      setError("Не удалось сохранить пользователя. Пожалуйста, попробуйте позже.");
    }
  };

  // Обработчик удаления пользователя
  const handleDelete = async (userid) => {
    try {
      // Получаем все userRoleID для данного пользователя
      const userRoles = await getUserRolesByUserId(userid);
  
      // Удаляем каждую роль пользователя по userRoleID
      for (const userRole of userRoles) {
        await removeUserRole(userRole.userroleid); // Передаем userRoleID вместо userid и roleid
      }
  
      // Удаляем пользователя
      await deleteUser(userid);
      setUsers((prev) => prev.filter((user) => user.userid !== userid));
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      setError("Не удалось удалить пользователя. Пожалуйста, попробуйте позже.");
    }
  };

  // Отображение ролей в таблице
  const renderRoles = (userid) => {
    const roles = userRolesMap[userid];
    if (!roles || roles.length === 0) return "Нет ролей";
    return roles.map((role) => role.rolename).join(", ");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setSpecialtyFilter("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление пользователями" />
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление пользователями
        </h1>
        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}
        
        {/* Панель поиска и фильтрации */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <div className="flex flex-col sm:flex-row gap-3 flex-grow">
            <Input
              type="text"
              placeholder="Поиск по ФИО или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 md:w-64"
            />
            <Input
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              type="select"
              className="w-full sm:w-48 sm:"
            >
              <option value="">Все роли</option>
              {roles.map((role) => (
                <option key={role.roleid} value={role.roleid}>
                  {role.rolename}
                </option>
              ))}
            </Input>
            <Input
              name="specialtyFilter"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              type="select"
              className="w-full sm:w-48"
            >
              <option value="">Все специальности</option>
              {specialties.map((spec) => (
                <option key={spec.specialtyid} value={spec.specialtyid}>
                  {spec.specialtyname}
                </option>
              ))}
            </Input>
            {(searchTerm || roleFilter || specialtyFilter) && (
              <Button 
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            Добавить пользователя
          </Button>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">ID</th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                    onClick={() => requestSort('name')}
                  >
                    ФИО {getSortIndicator('name')}
                  </th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Email</th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                    onClick={() => requestSort('roles')}
                  >
                    Роли {getSortIndicator('roles')}
                  </th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b cursor-pointer hover:bg-gray-50 text-xs sm:text-sm"
                    onClick={() => requestSort('specialty')}
                  >
                    Специальность {getSortIndicator('specialty')}
                  </th>
                  <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.userid} className="hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{user.userid}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                        {user.firstname} {user.middlename} {user.lastname}
                      </td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{user.email}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{renderRoles(user.userid)}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">
                        {getSpecialtyName(user.specialtyid)}
                      </td>
                      <td className="py-2 px-2 sm:px-4 border-b">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                          <Button
                            onClick={() => openModal(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                          >
                            Редактировать
                          </Button>
                          <Button
                            onClick={() => handleDelete(user.userid)}
                            className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-xs sm:text-sm">
                      {users.length === 0 ? "Нет данных о пользователях" : "Ничего не найдено"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentUser ? "Редактировать пользователя" : "Добавить пользователя"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Input
                label="Имя"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Введите имя"
                required
              />
              <Input
                label="Отчество"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Введите отчество"
              />
              <Input
                label="Фамилия"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Введите фамилию"
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите email"
                required
              />
              <Input
                label="Телефон"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Введите номер телефона"
              />
              <Input
                label="Дата рождения"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                placeholder="Введите дату рождения"
              />
              <Input
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Введите пароль"
                required={!currentUser}
              />
              <Input
                label="Специальность"
                name="specialtyID"
                value={formData.specialtyID || ""}
                onChange={handleInputChange}
                type="select"
              >
                <option value="">Выберите специальность</option>
                {specialties.map((spec) => (
                  <option key={spec.specialtyid} value={spec.specialtyid}>
                    {spec.specialtyname}
                  </option>
                ))}
              </Input>
              <Select
                label="Роли"
                name="roles"
                value={formData.roles}
                onChange={(selectedRoles) => setFormData((prev) => ({ ...prev, roles: selectedRoles }))}
                options={roles.map((role) => ({
                  value: role.roleid,
                  label: role.rolename,
                }))}
                isMulti
                placeholder="Выберите роли"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="mr-2"
                />
                <label className="text-sm sm:text-base">Активен</label>
              </div>
              <div className="flex justify-end gap-3 sm:gap-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                  {currentUser ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageUsers;