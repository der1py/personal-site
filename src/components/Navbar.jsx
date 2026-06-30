function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__content" aria-label="Main navigation">
        <a className="navbar__name" href="#about">
          Luke Fan
        </a>
        <ul>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#links">Links</a>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
