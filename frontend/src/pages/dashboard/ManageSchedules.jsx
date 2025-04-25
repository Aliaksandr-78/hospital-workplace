import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
} from "../../api/scheduleApi";
import { getAllUsers } from "../../api/userApi";
import { getAllEventTypes } from "../../api/eventTypesApi";
import { getAllRoles } from "../../api/roleApi";
import { getUserRolesByUserId } from "../../api/userRoleApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const ManageSchedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [formData, setFormData] = useState({
    doctorid: user?.userid || "",
    date: "",
    starttime: "",
    endtime: "",
    eventtypeid: "",
  });
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Добавляем ключ для принудительного обновления

  // Состояния для поиска и сортировки
  const [doctorSearch, setDoctorSearch] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

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

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rolesData, userRolesData] = await Promise.all([
          getAllRoles(),
          user?.userid ? getUserRolesByUserId(user.userid) : Promise.resolve([]),
        ]);
        setAllRoles(rolesData);
        setUserRoles(userRolesData);

        const [schedulesData, doctorsData, eventTypesData] = await Promise.all([
          getAllSchedules(),
          getAllUsers(),
          getAllEventTypes(),
        ]);
        
        setSchedules(schedulesData);
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
        setEventTypes(eventTypesData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, refreshKey]); // Добавляем refreshKey в зависимости

  // Фильтрация врачей для поиска
  useEffect(() => {
    if (doctors.length > 0) {
      const filtered = doctors.filter(doctor => 
        `${doctor.lastname} ${doctor.firstname}`
          .toLowerCase()
          .includes(doctorSearch.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  }, [doctorSearch, doctors]);

  // Фильтрация и сортировка расписаний
  useEffect(() => {
    let result = [...schedules];
    
    // Для доктора показываем только его расписание начиная с сегодняшнего дня
    if (isDoctor()) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      result = result.filter(schedule => 
        schedule.doctorid === user?.userid && 
        new Date(schedule.date) >= today
      );
    }
    
    // Фильтрация по врачу
    if (doctorSearch) {
      const searchLower = doctorSearch.toLowerCase();
      result = result.filter(schedule => {
        const doctor = doctors.find(d => d.userid === schedule.doctorid);
        if (!doctor) return false;
        return (
          doctor.lastname.toLowerCase().includes(searchLower) ||
          doctor.firstname.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Фильтрация по дате
    if (dateSearch) {
      const searchDate = new Date(dateSearch).toISOString().split('T')[0];
      result = result.filter(schedule => 
        schedule.date.includes(searchDate))
    }

    // Сортировка
    if (sortConfig.key) {
      result.sort((a, b) => {
        // Сортировка по врачу
        if (sortConfig.key === 'doctor') {
          const doctorA = doctors.find(d => d.userid === a.doctorid);
          const doctorB = doctors.find(d => d.userid === b.doctorid);
          const nameA = doctorA ? `${doctorA.lastname} ${doctorA.firstname}` : '';
          const nameB = doctorB ? `${doctorB.lastname} ${doctorB.firstname}` : '';
          return sortConfig.direction === 'asc' 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
        
        // Сортировка по типу события
        if (sortConfig.key === 'eventtype') {
          const typeA = eventTypes.find(et => et.eventtypeid === a.eventtypeid)?.eventname || '';
          const typeB = eventTypes.find(et => et.eventtypeid === b.eventtypeid)?.eventname || '';
          return sortConfig.direction === 'asc' 
            ? typeA.localeCompare(typeB)
            : typeB.localeCompare(typeA);
        }
        
        // Сортировка по остальным полям
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSchedules(result);
  }, [schedules, doctorSearch, dateSearch, doctors, eventTypes, sortConfig, isDoctor, user]);

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

  const openModal = (schedule = null) => {
    setCurrentSchedule(schedule);
    
    if (schedule) {
      const doctor = doctors.find(d => d.userid === schedule.doctorid);
      setSelectedDoctorName(doctor ? `${doctor.lastname} ${doctor.firstname}` : "");
      
      setFormData({
        doctorid: schedule.doctorid,
        date: new Date(schedule.date).toLocaleDateString('en-CA'),
        starttime: schedule.starttime.slice(0, 5),
        endtime: schedule.endtime.slice(0, 5),
        eventtypeid: schedule.eventtypeid,
      });
    } else {
      setSelectedDoctorName("");
      setFormData({
        doctorid: user?.userid || "",
        date: "",
        starttime: "",
        endtime: "",
        eventtypeid: "",
      });
    }
    
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentSchedule(null);
    setDoctorSearch("");
    setSelectedDoctorName("");
    setFormData({
      doctorid: user?.userid || "",
      date: "",
      starttime: "",
      endtime: "",
      eventtypeid: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorSearchChange = (e) => {
    setDoctorSearch(e.target.value);
  };

  const handleDateSearchChange = (e) => {
    setDateSearch(e.target.value);
  };

  const handleSelectDoctor = (doctorId, doctorName) => {
    setFormData(prev => ({ ...prev, doctorid: doctorId }));
    setSelectedDoctorName(doctorName);
    setDoctorSearch("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.doctorid || !formData.date || !formData.starttime || !formData.endtime || !formData.eventtypeid) {
      setError("Все поля обязательны для заполнения.");
      return;
    }
  
    // Проверка что дата не раньше сегодняшнего дня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(formData.date);
    
    if (selectedDate < today) {
      setError("Дата не может быть раньше сегодняшнего дня.");
      return;
    }
  
    // Проверка что время окончания позже времени начала
    if (formData.starttime >= formData.endtime) {
      setError("Время окончания должно быть позже времени начала.");
      return;
    }
  
    try {
      const scheduleData = {
        doctorid: formData.doctorid,
        date: new Date(formData.date).toISOString().split('T')[0],
        starttime: formData.starttime + ":00",
        endtime: formData.endtime + ":00",
        eventtypeid: formData.eventtypeid,
      };
  
      if (currentSchedule) {
        await updateSchedule(currentSchedule.scheduleid, scheduleData);
      } else {
        await createSchedule(scheduleData);
      }
  
      closeModal();
      setRefreshKey(prev => prev + 1); // Обновляем ключ для принудительного обновления данных
      setError("");
    } catch (error) {
      console.error("Ошибка при сохранении расписания:", error);
      setError("Не удалось сохранить расписание. Пожалуйста, попробуйте позже.");
    }
  };

  const handleDelete = async (scheduleID) => {
    try {
      await deleteSchedule(scheduleID);
      setRefreshKey(prev => prev + 1); // Обновляем ключ для принудительного обновления данных
    } catch (error) {
      console.error("Ошибка при удалении расписания:", error);
      setError("Не удалось удалить расписание. Пожалуйста, попробуйте позже.");
    }
  };

  const resetFilters = () => {
    setDoctorSearch("");
    setDateSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление расписанием" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isDoctor() ? "Мое расписание" : "Управление расписанием"}
        </h1>

        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <Input
              type="text"
              placeholder="Поиск по врачу..."
              value={doctorSearch}
              onChange={handleDoctorSearchChange}
              className="w-64"
              disabled={isDoctor()}
            />
            <Input
              type="date"
              placeholder="Поиск по дате..."
              value={dateSearch}
              onChange={handleDateSearchChange}
            />
            {(doctorSearch || dateSearch) && (
              <Button 
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700"
              >
                Сбросить фильтры
              </Button>
            )}
          </div>
          {(isAdmin() || isNurse()) && (
            <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
              Добавить расписание
            </Button>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  {!isDoctor() && (
                    <th 
                      className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => requestSort('doctor')}
                    >
                      Врач {getSortIndicator('doctor')}
                    </th>
                  )}
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('date')}
                  >
                    Дата {getSortIndicator('date')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('starttime')}
                  >
                    Начало {getSortIndicator('starttime')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('endtime')}
                  >
                    Конец {getSortIndicator('endtime')}
                  </th>
                  <th 
                    className="py-2 px-4 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort('eventtype')}
                  >
                    Тип события {getSortIndicator('eventtype')}
                  </th>
                  {(isAdmin() || isNurse()) && (<th className="py-2 px-4 border-b">Действия</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => {
                    const doctor = doctors.find(d => d.userid === schedule.doctorid);
                    const eventType = eventTypes.find(et => et.eventtypeid === schedule.eventtypeid);
                    
                    return (
                      <tr key={schedule.scheduleid} className="hover:bg-gray-50">
                        {!isDoctor() && (
                          <td className="py-2 px-4 border-b">
                            {doctor ? `${doctor.lastname} ${doctor.firstname} ${doctor.middlename }` : 'Неизвестный врач'}
                          </td>
                        )}
                        <td className="py-2 px-4 border-b">
                          {new Date(schedule.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {schedule.starttime.slice(0, 5)}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {schedule.endtime.slice(0, 5)}
                        </td>
                        <td className="py-2 px-4 border-b">
                          {eventType?.eventname || 'Неизвестный тип'}
                        </td>
                        {(isAdmin() || isNurse()) && (
                          <td className="py-2 px-4 border-b whitespace-nowrap">
                            <div className="flex space-x-2">
                                <Button
                                  onClick={() => openModal(schedule)}
                                  className="mr-2 bg-blue-600 hover:bg-blue-700"
                                >
                                  Редактировать
                                </Button>
                                <Button
                                  onClick={() => handleDelete(schedule.scheduleid)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Удалить
                                </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isDoctor() ? 5 : 6} className="py-4 text-center text-gray-500">
                      {schedules.length === 0 ? "Нет данных о расписаниях" : "Ничего не найдено"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {(isAdmin() || isNurse()) && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentSchedule ? "Редактировать расписание" : "Добавить расписание"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Врач *</label>
                  <Input
                    type="text"
                    placeholder="Поиск врача..."
                    value={doctorSearch}
                    onChange={handleDoctorSearchChange}
                    className="w-full"
                  />
                  {selectedDoctorName && (
                    <div className="p-2 bg-gray-100 rounded">
                      Выбран: {selectedDoctorName}
                    </div>
                  )}
                  <div className="max-h-60 overflow-y-auto border rounded">
                    {filteredDoctors.map(doctor => (
                      <div 
                        key={doctor.userid}
                        className={`p-2 hover:bg-blue-50 cursor-pointer ${formData.doctorid === doctor.userid ? 'bg-blue-100' : ''}`}
                        onClick={() => handleSelectDoctor(doctor.userid, `${doctor.lastname} ${doctor.firstname}`)}
                      >
                        {doctor.lastname} {doctor.firstname}
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  label="Дата *"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <Input
                  label="Начало *"
                  name="starttime"
                  value={formData.starttime}
                  onChange={handleInputChange}
                  type="time"
                  required
                />
                <Input
                  label="Конец *"
                  name="endtime"
                  value={formData.endtime}
                  onChange={handleInputChange}
                  type="time"
                  required
                />
                <Input
                  label="Тип события *"
                  name="eventtypeid"
                  value={formData.eventtypeid}
                  onChange={handleInputChange}
                  type="select"
                  required
                >
                  <option value="">Выберите тип события</option>
                  {eventTypes.map((eventType) => (
                    <option key={eventType.eventtypeid} value={eventType.eventtypeid}>
                      {eventType.eventname}
                    </option>
                  ))}
                </Input>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Отмена
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {currentSchedule ? "Сохранить" : "Добавить"}
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

export default ManageSchedules;