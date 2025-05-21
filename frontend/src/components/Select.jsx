import PropTypes from "prop-types";

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
  const handleChange = (e) => {
    if (isMulti) {
      const selectedOptions = Array.from(e.target.selectedOptions).map(
        (option) => option.value
      );
      onChange(selectedOptions);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <label className="mb-1 text-sm sm:text-base font-medium text-gray-700">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={handleChange}
        multiple={isMulti}
        className={`px-2 py-1.5 sm:px-3 sm:py-2 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500" : "focus:ring-blue-500"
        } text-sm sm:text-base`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 text-xs sm:text-sm text-red-500">{error}</span>}
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