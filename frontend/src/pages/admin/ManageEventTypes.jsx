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
      <Header appName="Управление типами событий" />

      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление типами событий
        </h1>

        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => openModal()} 
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
          >
            Добавить тип события
          </Button>
        </div>

        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">ID</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Название типа события</th>
                <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((eventType) => (
                <tr key={eventType.eventtypeid} className="hover:bg-gray-50">
                  <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{eventType.eventtypeid}</td>
                  <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{eventType.eventname}</td>
                  <td className="py-2 px-2 sm:px-4 border-b">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <Button
                        onClick={() => openModal(eventType)}
                        className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                      >
                        Редактировать
                      </Button>
                      <Button
                        onClick={() => handleDelete(eventType.eventtypeid)}
                        className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                      >
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              {currentEventType ? "Редактировать тип события" : "Добавить тип события"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <Input
                label="Название типа события"
                name="EventName"
                value={formData.EventName}
                onChange={handleInputChange}
                placeholder="Введите название типа события"
                required
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