import { useEffect, useState } from "react";
import {
  getAllDocumentTemplates,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate,
  downloadDocumentTemplate,
} from "../../api/documentTemplateApi";
import Button from "../../components/Button";
import Header from "../../components/Header";
import Loader from "../../components/Loader";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

const ManageDocumentTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [formData, setFormData] = useState({ name: "", file: null });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await getAllDocumentTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Ошибка при загрузке шаблонов:", error);
        setError("Не удалось загрузить шаблоны. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const openModal = (template = null) => {
    setCurrentTemplate(template);
    setFormData(template ? { name: template.name, file: null } : { name: "", file: null });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentTemplate(null);
    setFormData({ name: "", file: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    if (formData.file) {
      formDataToSend.append('file', formData.file);
    }

    try {
      if (currentTemplate) {
        const updatedTemplate = await updateDocumentTemplate(currentTemplate.templateid, formDataToSend);
        setTemplates((prev) =>
          prev.map((template) =>
            template.templateid === updatedTemplate.templateid ? updatedTemplate : template
          )
        );
      } else {
        const newTemplate = await createDocumentTemplate(formDataToSend);
        setTemplates((prev) => [...prev, newTemplate]);
      }
      closeModal();
    } catch (error) {
      console.error("Ошибка при сохранении шаблона:", error);
      setError("Не удалось сохранить шаблон. Пожалуйста, попробуйте позже.");
    }
  };

  const handleDownload = async (templateID, filename) => {
    try {
      const blob = await downloadDocumentTemplate(templateID);
  
      // Проверяем, что blob не пустой
      if (blob.size === 0) {
        throw new Error("Файл пустой");
      }
  
      // Создаем URL для скачивания файла
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Освобождаем URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при скачивании шаблона:", error);
      setError("Не удалось скачать шаблон. Пожалуйста, попробуйте позже.");
    }
  };

  const handleDelete = async (templateID) => {
    try {
      await deleteDocumentTemplate(templateID);
      setTemplates((prev) => prev.filter((template) => template.templateid !== templateID));
    } catch (error) {
      console.error("Ошибка при удалении шаблона:", error);
      setError("Не удалось удалить шаблон. Пожалуйста, попробуйте позже.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header appName="Управление шаблонами документов" />

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Управление шаблонами документов
        </h1>

        {loading && <Loader className="flex justify-center my-8" />}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-end mb-4">
          <Button onClick={() => openModal()} className="bg-green-600 hover:bg-green-700">
            Добавить шаблон
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Название</th>
                <th className="py-2 px-4 border-b">Файл</th>
                <th className="py-2 px-4 border-b">Действия</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.templateid} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{template.templateid}</td>
                  <td className="py-2 px-4 border-b">{template.name}</td>
                  <td className="py-2 px-4 border-b">
                    {template.filename && (
                      <Button
                        onClick={() => handleDownload(template.templateid, template.filename)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Скачать {template.filename}
                      </Button>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <Button
                      onClick={() => openModal(template)}
                      className="mr-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(template.templateid)}
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

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentTemplate ? "Редактировать шаблон" : "Добавить шаблон"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Название"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите название шаблона"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">Файл</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full"
                />
                {currentTemplate && currentTemplate.filename && (
                  <p className="text-sm text-gray-500 mt-2">Текущий файл: {currentTemplate.filename}</p>
                )}
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
                  {currentTemplate ? "Сохранить" : "Добавить"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageDocumentTemplates;