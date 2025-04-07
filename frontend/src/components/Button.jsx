import PropTypes from "prop-types"

const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  color = "primary",
}) => {
  const colorClasses = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-600 hover:bg-gray-700",
    success: "bg-green-600 hover:bg-green-700",
    danger: "bg-red-600 hover:bg-red-700",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-white font-semibold rounded-lg transition-all ${
        colorClasses[color] || colorClasses.primary
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  color: PropTypes.oneOf(["primary", "secondary", "success", "danger"]),
}

Button.defaultProps = {
  onClick: () => {},
  type: "button",
  className: "",
  disabled: false,
  color: "primary",
}

export default Button