import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { useAuth } from "../../context/AuthContext";
import {
  createService,
  getAllServices,
  updateService,
  deleteService,
} from "../../api/serviceApi";
import {
  getAllLabTests,
  createLabTest,
  updateLabTest,
  deleteLabTest,
} from "../../api/labTestCatalogApi";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import Header from "../../components/Header";
import { getAllRoles } from "../../api/roleApi";
import { getUserRolesByUserId } from "../../api/userRoleApi";

const ManageServices = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("services");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  
  const [labTests, setLabTests] = useState([]);
  const [filteredLabTests, setFilteredLabTests] = useState([]);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    methodology: ""
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

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
          setRolesLoading(false);
        }
      }
    };

    fetchUserRoles();
  }, [user?.userid]);

  // Проверка, является ли пользователь администратором
  const isAdmin = () => {
    if (rolesLoading) return false;
    
    return userRoles.some(userRole => {
      const role = allRoles.find(r => r.roleid === userRole.roleid);
      return role && role.rolename === "Администратор";
    });
  };

  useEffect(() => {
    if (user && !rolesLoading) {
      fetchData();
    }
  }, [user, activeTab, rolesLoading]);

  useEffect(() => {
    if (activeTab === "services") {
      filterAndSortServices();
    } else {
      filterAndSortLabTests();
    }
  }, [searchTerm, sortConfig, services, labTests, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (activeTab === "services") {
        const servicesData = await getAllServices();
        setServices(servicesData);
        setFilteredServices(servicesData);
      } else {
        const labTestsData = await getAllLabTests();
        setLabTests(labTestsData);
        setFilteredLabTests(labTestsData);
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
      setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortServices = () => {
    let result = [...services];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(service => 
        service.name.toLowerCase().includes(term) ||
        (service.description && service.description.toLowerCase().includes(term))
      );
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
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
    
    setFilteredServices(result);
  };

  const filterAndSortLabTests = () => {
    let result = [...labTests];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(test => 
        test.name.toLowerCase().includes(term) ||
        (test.methodology && test.methodology.toLowerCase().includes(term))
      );
    }
    
    if (sortConfig.key) {
      result.sort((a, b) => {
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
    
    setFilteredLabTests(result);
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  SortIndicator.propTypes = {
    field: PropTypes.string.isRequired
  };

  const openModal = (item = null) => {
    setCurrentItem(item);
    
    if (activeTab === "services") {
      setFormData({
        name: item ? item.name : "",
        description: item ? item.description : "",
        cost: item ? item.cost : "",
        methodology: ""
      });
    } else {
      setFormData({
        name: item ? item.name : "",
        description: "",
        cost: item ? item.cost : "",
        methodology: item ? item.methodology : ""
      });
    }
    
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
    setFormData({
      name: "",
      description: "",
      cost: "",
      methodology: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === "services") {
        const dataToSend = {
          name: formData.name,
          description: formData.description,
          cost: formData.cost
        };

        if (currentItem) {
          await updateService(currentItem.serviceid, dataToSend);
        } else {
          await createService(dataToSend);
        }
      } else {
        const dataToSend = {
          name: formData.name,
          methodology: formData.methodology,
          cost: formData.cost
        };

        if (currentItem) {
          await updateLabTest(currentItem.testid, dataToSend);
        } else {
          await createLabTest(dataToSend);
        }
      }
      
      closeModal();
      fetchData();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      setError(`Не удалось сохранить ${activeTab === "services" ? "услугу" : "лабораторный тест"}. Пожалуйста, попробуйте позже.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === "services") {
        await deleteService(id);
        setServices(prev => prev.filter(service => service.serviceid !== id));
      } else {
        await deleteLabTest(id);
        setLabTests(prev => prev.filter(test => test.testid !== id));
      }
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      setError(`Не удалось удалить ${activeTab === "services" ? "услугу" : "лабораторный тест"}. Пожалуйста, попробуйте позже.`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление медицинскими услугами" />
      
      <div className="container mx-auto p-3 sm:p-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
          Управление медицинскими услугами
        </h1>
        
        {/* Вкладки для переключения между услугами и тестами */}
        <div className="flex border-b mb-4 sm:mb-6 overflow-x-auto">
          <button
            className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "services" 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab("services")}
          >
            Медицинские услуги
          </button>
          <button
            className={`px-3 py-1.5 sm:px-4 sm:py-2 font-medium text-sm sm:text-base whitespace-nowrap ${
              activeTab === "labTests" 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab("labTests")}
          >
            Лабораторные тесты
          </button>
        </div>
        
        {loading && <Loader className="flex justify-center my-6 sm:my-8" />}
        {error && <p className="text-red-500 text-center mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>}
        
        {/* Поиск и кнопка добавления */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <Input
            type="text"
            placeholder={`Поиск ${activeTab === "services" ? "услуг" : "лабораторных тестов"}...`}
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-48 md:w-64"
          />
          {isAdmin() && (
            <Button
              onClick={() => openModal()}
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base"
            >
              {activeTab === "services" ? "Добавить услугу" : "Добавить тест"}
            </Button>
          )}
        </div>
        
        {/* Таблица с данными */}
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-md overflow-x-auto">
          {activeTab === "services" ? (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    Название <SortIndicator field="name" />
                  </th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("description")}
                  >
                    Описание <SortIndicator field="description" />
                  </th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("cost")}
                  >
                    Стоимость <SortIndicator field="cost" />
                  </th>
                  {isAdmin() && <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.serviceid} className="hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{service.name}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{service.description}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{service.cost}</td>
                      {isAdmin() && (
                        <td className="py-2 px-2 sm:px-4 border-b">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              onClick={() => openModal(service)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDelete(service.serviceid)}
                              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin() ? 4 : 3} className="text-center py-4 text-xs sm:text-sm">
                      {searchTerm ? "Ничего не найдено" : "Нет данных об услугах"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("name")}
                  >
                    Название <SortIndicator field="name" />
                  </th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("methodology")}
                  >
                    Методика <SortIndicator field="methodology" />
                  </th>
                  <th 
                    className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm cursor-pointer"
                    onClick={() => requestSort("cost")}
                  >
                    Стоимость <SortIndicator field="cost" />
                  </th>
                  {isAdmin() && <th className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">Действия</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLabTests.length > 0 ? (
                  filteredLabTests.map((test) => (
                    <tr key={test.testid} className="hover:bg-gray-50">
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{test.name}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{test.methodology}</td>
                      <td className="py-2 px-2 sm:px-4 border-b text-xs sm:text-sm">{test.cost} руб.</td>
                      {isAdmin() && (
                        <td className="py-2 px-2 sm:px-4 border-b">
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                            <Button
                              onClick={() => openModal(test)}
                              className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                            >
                              Редактировать
                            </Button>
                            <Button
                              onClick={() => handleDelete(test.testid)}
                              className="bg-red-600 hover:bg-red-700 text-xs sm:text-sm"
                            >
                              Удалить
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdmin() ? 4 : 3} className="text-center py-4 text-xs sm:text-sm">
                      {searchTerm ? "Ничего не найдено" : "Нет данных о лабораторных тестах"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Модальное окно для добавления/редактирования */}
        {isAdmin() && (
          <Modal isOpen={isModalOpen} onClose={closeModal}>
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                {currentItem 
                  ? `Редактировать ${activeTab === "services" ? "услугу" : "лабораторный тест"}` 
                  : `Создать новую ${activeTab === "services" ? "услугу" : "лабораторный тест"}`}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <Input
                  label="Название"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={`Введите название ${activeTab === "services" ? "услуги" : "лабораторного теста"}`}
                  required
                />
                
                {activeTab === "services" ? (
                  <Input
                    label="Описание"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Введите описание услуги"
                    type="textarea"
                  />
                ) : (
                  <Input
                    label="Методика"
                    name="methodology"
                    value={formData.methodology}
                    onChange={handleInputChange}
                    placeholder="Введите методику выполнения"
                    type="textarea"
                    required
                  />
                )}
                
                <Input
                  label="Стоимость"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="Введите стоимость"
                  required
                  min="0"
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
                    {currentItem ? "Сохранить" : "Создать"}
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

export default ManageServices;