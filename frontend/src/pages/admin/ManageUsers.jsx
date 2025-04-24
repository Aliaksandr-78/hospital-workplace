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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление пользователями
        </h1>
        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {/* Панель поиска и фильтрации */}
        <div className="flex justify-between mb-4 flex-wrap gap-4">
          <div className="flex space-x-4 flex-wrap">
            <Input
              type="text"
              placeholder="Поиск по ФИО или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Input
              name="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              type="select"
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
                className="bg-gray-600 hover:bg-gray-700"
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-green-600 hover:bg-green-700"
          >
            Добавить пользователя
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">ID</th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('name')}
                  >
                    ФИО {getSortIndicator('name')}
                  </th>
                  <th className="py-2 px-4 border-b">Email</th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('roles')}
                  >
                    Роли {getSortIndicator('roles')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('specialty')}
                  >
                    Специальность {getSortIndicator('specialty')}
                  </th>
                  <th className="py-2 px-4 border-b">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.userid} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{user.userid}</td>
                      <td className="py-2 px-4 border-b">
                        {user.firstname} {user.middlename} {user.lastname}
                      </td>
                      <td className="py-2 px-4 border-b">{user.email}</td>
                      <td className="py-2 px-4 border-b">{renderRoles(user.userid)}</td>
                      <td className="py-2 px-4 border-b">
                        {getSpecialtyName(user.specialtyid)}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <Button
                          onClick={() => openModal(user)}
                          className="mr-2 bg-blue-600 hover:bg-blue-700"
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDelete(user.userid)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      {users.length === 0 ? "Нет данных о пользователях" : "Ничего не найдено"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentUser ? "Редактировать пользователя" : "Добавить пользователя"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                isMulti // Включаем множественный выбор
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
                <label>Активен</label>
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Отмена
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
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