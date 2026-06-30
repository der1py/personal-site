function IconLink({ href, icon, label, newTab = true }) {
  return (
    <a
      className="icon-link"
      href={href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
    >
      <img className="icon-link__icon" src={icon} alt="" />
      <span>{label}</span>
    </a>
  )
}

export default IconLink
