import githubIcon from '../assets/github.svg'
import linkedinIcon from '../assets/linkedin.svg'
import IconLink from './IconLink'

const links = [
  { label: 'GitHub', href: 'https://github.com/der1py', icon: githubIcon },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/luke-fan',
    icon: linkedinIcon,
  },
]

function Links() {
  return (
    <div>
    <ul className="links">
      {links.map((link) => (
        <li key={link.label}>
          <IconLink href={link.href} icon={link.icon} label={link.label} />
        </li>
      ))}
    </ul>
    <p>Email: luke.fan [at] uwaterloo [dot] ca </p>
    </div>
  )
}

export default Links
