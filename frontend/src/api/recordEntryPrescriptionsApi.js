import api from "./axiosInstance";

/**
 * Создает связь между записью в карте и назначением
 * @param {Object} data - Данные для создания связи
 * @param {number} data.EntryID - ID записи в медицинской карте
 * @param {number} data.PrescriptionID - ID назначения
 * @returns {Promise<Object>} - Созданная связь
 */
export const createEntryPrescription = async ({ entryid, prescriptionid }) => {
  try {
    // Явно формируем объект с правильными именами полей
    const requestData = {
      EntryID: entryid,
      PrescriptionID: prescriptionid
    };
    
    console.log('Отправляемые данные связи:', requestData); // Логирование
    
    const response = await api.post('record-entry-prescriptions/recordEntryPrescriptionsCreate/', requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании связи:', {
      requestData: { entryid, prescriptionid },
      response: error.response?.data
    });
    throw error;
  }
};

/**
 * Удаляет связь между записью в карте и назначением
 * @param {number} EntryID - ID записи в медицинской карте
 * @param {number} PrescriptionID - ID назначения
 * @returns {Promise<Object>} - Результат удаления
 */
export const deleteEntryPrescription = async (EntryID, PrescriptionID) => {
  try {
    const response = await api.delete(`record-entry-prescriptions/recordEntryPrescriptionsDelete/${EntryID}/${PrescriptionID}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении связи:', error);
    throw new Error(error.response?.data?.error || 'Не удалось удалить связь');
  }
};

/**
 * Получает все назначения для определенной записи в карте
 * @param {number} EntryID - ID записи в медицинской карте
 * @returns {Promise<Array>} - Список назначений
 */
export const getPrescriptionsByEntry = async (EntryID) => {
  try {
    const response = await api.get(`record-entry-prescriptions/recordEntryPrescriptionsByEntry/${EntryID}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении назначений:', error);
    throw new Error(error.response?.data?.error || 'Не удалось получить назначения');
  }
};