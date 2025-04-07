import PropTypes from "prop-types";

/**
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка для поля выбора.
 * @param {string} props.name - Имя поля выбора.
 * @param {Array} props.options - Массив опций для выбора.
 * @param {Array|string|number} props.value - Выбранное значение (может быть массивом для множественного выбора).
 * @param {Function} props.onChange - Функция обработки изменения значения.
 * @param {string} props.className - Дополнительные классы для контейнера.
 * @param {string} props.error - Сообщение об ошибке.
 * @param {boolean} props.isMulti - Флаг множественного выбора.
 * @returns {JSX.Element} - JSX элемент поля выбора.
 */
const Select = ({
  label,
  name,
  options,
  value,
  onChange,
  className = "",
  error = "",
  isMulti = false,
}) => {
  // Обработчик изменения значения
  const handleChange = (e) => {
    if (isMulti) {
      // Для множественного выбора получаем массив выбранных значений
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      onChange(selectedOptions);
    } else {
      // Для одиночного выбора получаем одно значение
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={handleChange}
        multiple={isMulti} // Включаем множественный выбор
        className={`px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500" : "focus:ring-blue-500"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
  isMulti: PropTypes.bool,
};

Select.defaultProps = {
  label: "",
  className: "",
  error: "",
  isMulti: false,
};

export default Select;