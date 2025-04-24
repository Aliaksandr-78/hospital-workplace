import PropTypes from "prop-types";

/**
 * @param {Object} props - Свойства компонента.
 * @param {string} props.label - Метка для поля ввода.
 * @param {string} props.type - Тип поля ввода (например, "text", "password", "select", "textarea").
 * @param {string|number} props.value - Значение поля ввода.
 * @param {Function} props.onChange - Функция обработки изменения значения.
 * @param {string} props.placeholder - Плейсхолдер для поля ввода.
 * @param {string} props.className - Дополнительные классы для контейнера.
 * @param {string} props.error - Сообщение об ошибке.
 * @param {ReactNode} props.children - Дочерние элементы (для типа "select").
 * @param {number} props.rows - Количество строк (для textarea).
 * @param {Object} props.rest - Дополнительные атрибуты HTML-элемента.
 * @returns {JSX.Element} - JSX элемент поля ввода.
 */
const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  className = "",
  error = "",
  children,
  rows = 3,
  ...rest
}) => {
  // Если тип "select", рендерим выпадающий список
  if (type === "select") {
    return (
      <div className={`flex flex-col ${className}`}>
        {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}

        <select
          value={value}
          onChange={onChange}
          className={`px-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          }`}
          {...rest}
        >
          {children}
        </select>

        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  // Если тип "textarea", рендерим многострочное поле
  if (type === "textarea") {
    return (
      <div className={`flex flex-col ${className}`}>
        {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}

        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`px-3 py-2 border ${
            error ? "border-red-500" : "border-gray-300"
          } rounded-lg focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          }`}
          {...rest}
        />

        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  // Для всех остальных типов рендерим обычный input
  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500" : "focus:ring-blue-500"
        }`}
        {...rest}
      />

      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  children: PropTypes.node, // Для типа "select"
  rows: PropTypes.number, // Для типа "textarea"
};

Input.defaultProps = {
  type: "text",
  placeholder: "",
  className: "",
  error: "",
  children: null,
  rows: 3,
};

export default Input;