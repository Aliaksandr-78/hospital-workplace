import PropTypes from "prop-types";
import { useEffect, useRef } from "react";

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
  const baseClasses = "px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-base w-full transition-colors";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500";
  const selectRef = useRef(null);

  // Для мобильных устройств добавляем обработчик изменения размера
  useEffect(() => {
    if (type === "select" && selectRef.current) {
      const handleResize = () => {
        if (window.innerWidth < 640) {
          selectRef.current.size = 1; // Показываем как обычный select на мобильных
        } else {
          selectRef.current.size = 0; // Сбрасываем на дефолтное поведение
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [type]);

  if (type === "select") {
    return (
      <div className={`flex flex-col ${className}`}>
        {label && <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">{label}</label>}
        <div className="relative">
          <select
            value={value}
            onChange={onChange}
            className={`
              ${baseClasses} 
              ${errorClasses}
              appearance-none pr-8 
              w-full
              text-ellipsis
              max-h-[40px] sm:max-h-none
            `}
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
            {...rest}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <span className="mt-1 text-xs sm:text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`flex flex-col ${className}`}>
        {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClasses} ${errorClasses} min-h-[100px]`}
          {...rest}
        />
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-2 text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${baseClasses} ${errorClasses}`}
        {...rest}
      />
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  children: PropTypes.node,
  rows: PropTypes.number,
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