import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createService,
  getAllServices,
  updateService,
  deleteService,
} from "../../api/serviceApi";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Header from "../../components/Header";

const ManageServices = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
  });

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Функция для загрузки данных об услугах
  const fetchData = async () => {
    try {
      setLoading(true);
      const servicesData = await getAllServices();
      setServices(servicesData);
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик открытия модального окна для добавления/редактирования
  const openModal = async (service = null) => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        cost: service.cost,
      });
      setCurrentService(service);
    } else {
      setFormData({
        name: "",
        description: "",
        cost: "",
      });
      setCurrentService(null);
    }
    setModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const closeModal = () => {
    setModalOpen(false);
    setCurrentService(null);
    setFormData({
      name: "",
      description: "",
      cost: "",
    });
  };

  // Обработчик изменения данных в форме
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Обработчик отправки формы (создание/редактирование услуги)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        cost: formData.cost,
      };

      if (currentService) {
        await updateService(currentService.serviceid, dataToSend);
      } else {
        await createService(dataToSend);
      }
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Ошибка при сохранении услуги:", error);
      setError("Не удалось сохранить услугу. Пожалуйста, попробуйте позже.");
    }
  };

  // Обработчик удаления услуги
  const handleDelete = async (serviceid) => {
    try {
      await deleteService(serviceid);
      fetchData();
    } catch (error) {
      console.error("Ошибка при удалении услуги:", error);
      setError("Не удалось удалить услугу. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление услугами" />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление услугами
        </h1>
        {loading && <Loader className="flex justify-center my-8" />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => openModal()}
            className="bg-green-600 hover:bg-green-700"
          >
            Создать новую услугу
          </Button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Описание</th>
                <th className="py-2 px-4 border-b">Стоимость</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service.serviceid} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{service.name}</td>
                    <td className="py-2 px-4 border-b">{service.description}</td>
                    <td className="py-2 px-4 border-b">{service.cost}</td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openModal(service)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Редактировать
                        </Button>
                        <Button
                          onClick={() => handleDelete(service.serviceid)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Удалить
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Нет данных об услугах.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentService ? "Редактировать услугу" : "Создать новую услугу"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите название услуги"
                required
              />
              <Input
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Введите описание услуги"
              />
              <Input
                label="Стоимость"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleInputChange}
                placeholder="Введите стоимость услуги"
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
                  {currentService ? "Сохранить" : "Создать"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageServices;