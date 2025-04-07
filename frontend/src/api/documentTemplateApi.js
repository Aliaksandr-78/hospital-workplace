import api from "./axiosInstance"

/**
 * @param {Object} templateData - Данные для создания шаблона.
 * @returns {Promise<Object>} - Созданный шаблон.
 */
export const createDocumentTemplate = async (formData) => {
  try {
    const response = await api.post("document-template/documentTemplateCreate/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка при создании шаблона документа:", error);
    throw error;
  }
};

/**
 * @param {string} templateID - ID шаблона.
 * @param {Object} updatedData - Обновленные данные.
 * @returns {Promise<Object>} - Обновленный шаблон.
 */
export const updateDocumentTemplate = async (templateID, formData) => {
  try {
    const response = await api.put(`document-template/documentTemplateUpdate/${templateID}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении шаблона документа ID ${templateID}:`, error);
    throw error;
  }
};

export const downloadDocumentTemplate = async (templateID) => {
  try {
    const response = await api.get(`document-template/documentTemplateDownload/${templateID}`, {
      responseType: 'blob', // Указываем, что ожидаем бинарные данные
    });

    // Проверяем, что данные не пустые
    if (response.data.size === 0) {
      throw new Error("Файл пустой");
    }

    return response.data;
  } catch (error) {
    console.error(`Ошибка при загрузке шаблона документа ID ${templateID}:`, error);
    throw error;
  }
};

/**
 * @returns {Promise<Array>} - Список шаблонов.
 */
export const getAllDocumentTemplates = async () => {
  try {
    const response = await api.get("document-template/documentTemplateAll/")
    return response.data
  } catch (error) {
    console.error("Ошибка при загрузке списка шаблонов документов:", error)
    throw error
  }
}

/**
 * @param {string} templateID - ID шаблона.
 * @returns {Promise<Object>} - Данные шаблона.
 */
export const getDocumentTemplateById = async (templateID) => {
  try {
    const response = await api.get(`document-template/documentTemplateId/${templateID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при загрузке шаблона документа ID ${templateID}:`, error)
    throw error
  }
}

/**
 * @param {string} templateID - ID шаблона.
 * @returns {Promise<Object>} - Результат удаления.
 */
export const deleteDocumentTemplate = async (templateID) => {
  try {
    const response = await api.delete(`document-template/documentTemplateDelete/${templateID}`)
    return response.data
  } catch (error) {
    console.error(`Ошибка при удалении шаблона документа ID ${templateID}:`, error)
    throw error
  }
}