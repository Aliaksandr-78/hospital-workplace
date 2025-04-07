const multer = require('multer');
const path = require('path');

// Используем memoryStorage для хранения файла в памяти
const storage = multer.memoryStorage();

// Фильтр для проверки типа файла (опционально)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    cb(null, true); // Принимаем файл
  } else {
    cb(new Error('Неподдерживаемый тип файла'), false); // Отклоняем файл
  }
};

// Инициализация multer с настройками
const upload = multer({
  storage: storage, // Используем memoryStorage
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Ограничение размера файла (5 МБ)
  },
});

module.exports = upload;