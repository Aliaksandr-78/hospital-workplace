import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
} from "../../api/patientApi";
import { getAllRoles } from "../../api/roleApi";
import { getUserRolesByUserId } from "../../api/userRoleApi";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Header from "../../components/Header";

const Patients = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    email: "",
    address: "",
  });
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);

  // Проверка ролей
  const isAdmin = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Администратор";
    });
  };

  const isNurse = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Медсестра";
    });
  };

  const isDoctor = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Доктор";
    });
  };

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (user) {
      fetchData();
      fetchUserRoles();
    }
  }, [user]);

  // Загрузка ролей пользователя
  const fetchUserRoles = async () => {
    try {
      const [rolesData, userRolesData] = await Promise.all([
        getAllRoles(),
        user?.userid ? getUserRolesByUserId(user.userid) : Promise.resolve([]),
      ]);
      setAllRoles(rolesData);
      setUserRoles(userRolesData);
    } catch (error) {
      console.error("Ошибка при загрузке ролей:", error);
    }
  };

  // Эффект для фильтрации пациентов при изменении searchTerm
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (patient.middlename &&
            patient.middlename.toLowerCase().includes(searchTerm.toLowerCase())) ||
          patient.phonenumber.includes(searchTerm) ||
          (patient.email &&
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Функция для загрузки данных о пациентах
  const fetchData = async () => {
    try {
      setLoading(true);
      const patientsData = await getAllPatients();
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = async (patient = null) => {
    if (patient) {
      // Преобразуем дату в формат YYYY-MM-DD
      const formattedDateOfBirth = new Date(patient.dateofbirth)
        .toISOString()
        .split("T")[0];

      // Заполняем форму данными пациента
      setFormData({
        firstName: patient.firstname,
        middleName: patient.middlename,
        lastName: patient.lastname,
        dateOfBirth: formattedDateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phonenumber,
        email: patient.email,
        address: patient.address,
      });
      setCurrentPatient(patient);
    } else {
      // Сбрасываем форму для нового пациента
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        phoneNumber: "",
        email: "",
        address: "",
      });
      setCurrentPatient(null);
    }
    setModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentPatient(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
      email: "",
      address: "",
    });
  };

  // Обработчик изменения данных в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработчик отправки формы (создание/редактирование пациента)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
      };

      if (currentPatient) {
        await updatePatient(currentPatient.patientid, dataToSend);
      } else {
        await createPatient(dataToSend);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Ошибка при сохранении пациента:", error);
      setError("Не удалось сохранить пациента. Пожалуйста, попробуйте позже.");
    }
  };

  // Обработчик удаления пациента
  const handleDelete = async (patientid) => {
    try {
      await deletePatient(patientid);
      fetchData();
    } catch (error) {
      console.error("Ошибка при удалении пациента:", error);
      setError("Не удалось удалить пациента. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление пациентами" />
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление пациентами
        </h1>
        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}
        
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <Input
            type="text"
            placeholder="Поиск пациентов..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="flex-grow max-w-md"
          />
          {(isAdmin() || isNurse()) && (
            <Button
              onClick={() => openModal()}
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
            >
              Создать нового пациента
            </Button>
          )}
        </div>
        
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Фамилия</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Имя</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Отчество</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Дата рождения</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Пол</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Телефон</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Email</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Адрес</th>
                {!isDoctor() && <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const formattedDate = new Date(patient.dateofbirth).toLocaleDateString();
                  return (
                    <tr key={patient.patientid} className="hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.lastname}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.firstname}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.middlename}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{formattedDate}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.gender}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.phonenumber}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.email}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{patient.address}</td>
                      {!isDoctor() && (
                        <td className="py-2 px-2 sm:px-4 border-b">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              onClick={() => openModal(patient)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                            >
                              Редактировать
                            </Button>
                            {isAdmin() && (
                              <Button
                                onClick={() => handleDelete(patient.patientid)}
                                className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                              >
                                Удалить
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={!isDoctor() ? 9 : 8} className="text-center py-4 text-xs sm:text-sm">
                    {searchTerm.trim() === ""
                      ? "Нет данных о пациентах."
                      : "Пациенты не найдены."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {(isAdmin() || isNurse()) && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                {currentPatient ? "Редактировать пациента" : "Создать нового пациента"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <Input
                  label="Фамилия"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Введите фамилию"
                  required
                />
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
                  label="Дата рождения"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  placeholder="Введите дату рождения"
                />
                <Input
                  label="Пол"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  type="select"
                >
                  <option value="">Выберите пол</option>
                  <option value="Мужской">Мужской</option>
                  <option value="Женский">Женский</option>
                </Input>
                <Input
                  label="Телефон"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Введите номер телефона"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Введите email"
                />
                <Input
                  label="Адрес"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Введите адрес"
                />
                <div className="flex justify-end gap-3 sm:gap-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-600 hover:bg-gray-700 text-sm sm:text-base"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-sm sm:text-base">
                    {currentPatient ? "Сохранить" : "Создать"}
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Patients;