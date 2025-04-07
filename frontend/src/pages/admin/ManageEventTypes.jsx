import { useEffect, useState } from "react";
import {
  getAllEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../../api/eventTypesApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const ManageEventTypes = () => {
  const [eventTypes, setEventTypes] = useState([]); // Состояние для списка типов событий
  const [loading, setLoading] = useState(true); // Состояние для загрузки
  const [error, setError] = useState(""); // Состояние для ошибок
  const [isModalOpen, setModalOpen] = useState(false); // Состояние для модального окна
  const [currentEventType, setCurrentEventType] = useState(null); // Состояние для текущего типа события (редактирование/добавление)
  const [formData, setFormData] = useState({ EventName: "" }); // Состояние для данных формы

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        const data = await getAllEventTypes();
        setEventTypes(data);
      } catch (error) {
        console.error("Ошибка при загрузке типов событий:", error);
        setError("Не удалось загрузить типы событий. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, []);

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = (eventType = null) => {
    setCurrentEventType(eventType);
    setFormData(eventType ? { EventName: eventType.eventname } : { EventName: "" });
    setModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentEventType(null);
    setFormData({ EventName: "" });
  };

  // Обработчик изменения данных формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы (добавление/редактирование)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const eventTypeData = { eventName: formData.EventName };
      if (currentEventType) {
        const updatedEventType = await updateEventType(currentEventType.eventtypeid, eventTypeData);
        setEventTypes((prev) =>
          prev.map((eventType) =>
            eventType.eventtypeid === updatedEventType.eventtypeid ? updatedEventType : eventType
          )
        );
      } else {
        // Добавление нового типа события
        const newEventType = await createEventType(eventTypeData);
        setEventTypes((prev) => [...prev, newEventType]);
      }
      closeModal();
    } catch (error) {
      console.error("Ошибка при сохранении типа события:", error);
      setError("Не удалось сохранить тип события. Пожалуйста, попробуйте позже.");
    }
  };

  // Обработчик удаления типа события
  const handleDelete = async (eventTypeID) => {
    try {
      await deleteEventType(eventTypeID);
      setEventTypes((prev) => prev.filter((eventType) => eventType.eventtypeid !== eventTypeID));
    } catch (error) {
      console.error("Ошибка при удалении типа события:", error);
      setError("Не удалось удалить тип события. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка с кнопкой выхода */}
      <Header appName="Управление типами событий" />

      {/* Основное содержимое */}
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление типами событий
        </h1>

        {/* Индикатор загрузки */}
        {loading && <Loader className="flex justify-center my-8" />}

        {/* Сообщение об ошибке */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Кнопка добавления нового типа события */}
        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить тип события
          </Button>
        </div>

        {/* Таблица типов событий */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название типа события</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((eventType) => (
                <tr key={eventType.eventtypeid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{eventType.eventtypeid}</td>
                  <td className="py-2 px-4 border-b">{eventType.eventname}</td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(eventType)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(eventType.eventtypeid)}
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

        {/* Модальное окно для добавления/редактирования типа события */}
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentEventType ? "Редактировать тип события" : "Добавить тип события"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название типа события"
                name="EventName"
                value={formData.EventName}
                onChange={handleInputChange}
                placeholder="Введите название типа события"
                required
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
                  {currentEventType ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageEventTypes;