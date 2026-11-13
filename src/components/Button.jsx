const Button = ({ href, tone = "carbon", small = false, className = "", children, ...props }) => {
  const classes = [
    "btn",
    tone === "canary" ? "btn--canary" : "",
    small ? "btn--small" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
