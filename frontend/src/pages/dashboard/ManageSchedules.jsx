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
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const ManageSchedules = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]); // Состояние для списка расписаний
  const [doctors, setDoctors] = useState([]); // Состояние для списка врачей
  const [eventTypes, setEventTypes] = useState([]); // Состояние для списка типов событий
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [error, setError] = useState(""); // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false); // Состояние для модального окна
  const [currentSchedule, setCurrentSchedule] = useState(null); // Состояние для текущего расписания (редактирование/добавление)
  const [formData, setFormData] = useState({
    doctorid: user?.userid || "",
    date: "",
    starttime: "",
    endtime: "",
    eventtypeid: "",
  }); // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schedulesData, doctorsData, eventTypesData] = await Promise.all([
          getAllSchedules(),
          getAllUsers(),
          getAllEventTypes(),
        ]);
        setSchedules(schedulesData);
        setDoctors(doctorsData);
        setEventTypes(eventTypesData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (schedule = null) => {
    setCurrentSchedule(schedule);
    setFormData(
      schedule
        ? {
            doctorid: schedule.doctorid,
            date: new Date(schedule.date).toLocaleDateString('en-CA'), // Форматируем дату
            starttime: schedule.starttime.slice(0, 5), // Форматируем время (HH:mm)
            endtime: schedule.endtime.slice(0, 5), // Форматируем время (HH:mm)
            eventtypeid: schedule.eventtypeid,
          }
        : {
            doctorid: user?.userid || "",
            date: "",
            starttime: "",
            endtime: "",
            eventtypeid: "",
          }
    );
    setModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentSchedule(null);
    setFormData({
      doctorid: user?.userid || "",
      date: "",
      starttime: "",
      endtime: "",
      eventtypeid: "",
    });
  };

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesData, doctorsData, eventTypesData] = await Promise.all([
        getAllSchedules(),
        getAllUsers(),
        getAllEventTypes(),
      ]);
      setSchedules(schedulesData); // Обновляем состояние schedules
      setDoctors(doctorsData);
      setEventTypes(eventTypesData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Проверка, что все поля заполнены
    if (!formData.doctorid || !formData.date || !formData.starttime || !formData.endtime || !formData.eventtypeid) {
      setError("Все поля обязательны для заполнения.");
      return;
    }
  
    try {
      const scheduleData = {
        doctorid: formData.doctorid, // Используем snake_case
        date: new Date(formData.date).toISOString().split('T')[0], // Форматируем дату в YYYY-MM-DD
        starttime: formData.starttime + ":00", // Добавляем секунды
        endtime: formData.endtime + ":00", // Добавляем секунды
        eventtypeid: formData.eventtypeid, // Используем snake_case
      };
  
      let result;
      if (currentSchedule) {
        result = await updateSchedule(currentSchedule.scheduleid, scheduleData);
      } else {
        result = await createSchedule(scheduleData);
      }
  
      console.log("Результат запроса:", result); // Логирование результата
  
      closeModal();
      fetchData(); // Обновляем данные в таблице
    } catch (error) {
      console.error("Ошибка при сохранении расписания:", error);
      setError("Не удалось сохранить расписание. Пожалуйста, попробуйте позже.");
    }
  };

  // Обработчик удаления расписания
  const handleDelete = async (scheduleID) => {
    try {
      await deleteSchedule(scheduleID);
      setSchedules((prev) => prev.filter((schedule) => schedule.scheduleid !== scheduleID));
    } catch (error) {
      console.error("Ошибка при удалении расписания:", error);
      setError("Не удалось удалить расписание. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление расписанием" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Управление расписанием</h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления нового расписания */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить расписание
          </Button>
        </div>

        {/* Таблица расписаний */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Врач</th>
                <th className="py-2 px-4 border-b">Дата</th>
                <th className="py-2 px-4 border-b">Начало</th>
                <th className="py-2 px-4 border-b">Конец</th>
                <th className="py-2 px-4 border-b">Тип события</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.scheduleid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {doctors.find((d) => d.userid === schedule.doctorid)?.lastname}{" "}
                    {doctors.find((d) => d.userid === schedule.doctorid)?.firstname}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(schedule.date).toLocaleDateString()} {/* Форматируем дату */}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {schedule.starttime.slice(0, 5)} {/* Форматируем время (HH:mm) */}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {schedule.endtime.slice(0, 5)} {/* Форматируем время (HH:mm) */}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {eventTypes.find((et) => et.eventtypeid === schedule.eventtypeid)?.eventname}
                  </td>
                  <td className="py-2 px-4 border-b">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Модальное окно для добавления/редактирования расписания */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentSchedule ? "Редактировать расписание" : "Добавить расписание"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Врач"
                name="doctorid"
                value={formData.doctorid}
                onChange={handleInputChange}
                type="select"
              >
                <option value="">Выберите врача</option>
                {doctors.map((doctor) => (
                  <option key={doctor.userid} value={doctor.userid}>
                    {doctor.lastname} {doctor.firstname}
                  </option>
                ))}
              </Input>
              <Input
                label="Дата"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
                required
              />
              <Input
                label="Начало"
                name="starttime"
                value={formData.starttime}
                onChange={handleInputChange}
                type="time"
                required
              />
              <Input
                label="Конец"
                name="endtime"
                value={formData.endtime}
                onChange={handleInputChange}
                type="time"
                required
              />
              <Input
                label="Тип события"
                name="eventtypeid"
                value={formData.eventtypeid}
                onChange={handleInputChange}
                type="select"
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
      </div>
    </div>
  );
};

export default ManageSchedules;