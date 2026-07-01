import { useEffect, useState } from 'react'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar__content" aria-label="Main navigation">
        <a className="navbar__name" href="#">
          Luke Fan
        </a>
        <div className="navbar__actions">
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
          <Switch />
        </div>
      </nav>
    </header>
  )
}

function Switch() {
  const [isDark, setIsDark] = useState(
    () => {
      const savedTheme = localStorage.getItem('theme')

      return (
        savedTheme === 'dark' ||
        (savedTheme === null &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      )
    },
  )

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <label className="theme-switch">
      <input
        type="checkbox"
        checked={isDark}
        onChange={(event) => setIsDark(event.target.checked)}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      />
      <span className="theme-switch__slider" />
    </label>
  )
}

export default Navbar
