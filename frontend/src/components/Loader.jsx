import PropTypes from "prop-types"

/**
 * @param {Object} props - Свойства компонента.
 * @param {string} props.size - Размер лоадера (например, "6" для `w-6 h-6`).
 * @param {string} props.color - Цвет лоадера (например, "blue-500").
 * @param {string} props.className - Дополнительные классы для контейнера.
 * @returns {JSX.Element} - JSX элемент лоадера.
 */
const Loader = ({ size = "6", color = "blue-500", className = "" }) => {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`w-${size} h-${size} border-4 border-${color} border-t-transparent rounded-full animate-spin`}
      ></div>
    </div>
  )
}

Loader.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
};

Loader.defaultProps = {
  size: "6",
  color: "blue-500",
  className: "",
}

export default Loader