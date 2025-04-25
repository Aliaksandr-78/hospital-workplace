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
      return role && role.rolename === "Admin";
    });
  };

  const isNurse = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Nurse";
    });
  };

  const isDoctor = () => {
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Doctor";
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
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление пациентами
        </h1>
        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
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
              className="bg-green-600 hover:bg-green-700"
            >
              Создать нового пациента
            </Button>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Фамилия</th>
                <th className="py-2 px-4 border-b">Имя</th>
                <th className="py-2 px-4 border-b">Отчество</th>
                <th className="py-2 px-4 border-b">Дата рождения</th>
                <th className="py-2 px-4 border-b">Пол</th>
                <th className="py-2 px-4 border-b">Телефон</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Адрес</th>
                {!isDoctor() &&<th className="py-2 px-4 border-b">Действия</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => {
                  const formattedDate = new Date(patient.dateofbirth).toLocaleDateString();
                  return (
                    <tr key={patient.patientid} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b">{patient.lastname}</td>
                      <td className="py-2 px-4 border-b">{patient.firstname}</td>
                      <td className="py-2 px-4 border-b">{patient.middlename}</td>
                      <td className="py-2 px-4 border-b">{formattedDate}</td>
                      <td className="py-2 px-4 border-b">{patient.gender}</td>
                      <td className="py-2 px-4 border-b">{patient.phonenumber}</td>
                      <td className="py-2 px-4 border-b">{patient.email}</td>
                      <td className="py-2 px-4 border-b">{patient.address}</td>
                      {!isDoctor() && (
                        <td className="py-2 px-4 border-b">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => openModal(patient)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Редактировать
                            </Button>
                            {isAdmin() && (
                              <Button
                                onClick={() => handleDelete(patient.patientid)}
                                className="bg-red-600 hover:bg-red-700"
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
                  <td colSpan="9" className="text-center py-4">
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
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentPatient ? "Редактировать пациента" : "Создать нового пациента"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
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