import githubIcon from '../assets/github.svg'
import rocketIcon from '../assets/rocket.svg'
import IconLink from './IconLink'

function ProjectCard({ title, description, image, href, demo }) {
  return (
    <article className="project-card">
      {image && (
        <img
          className="project-card__image"
          src={image}
          alt={`${title} preview`}
        />
      )}
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="project-card__links">
        {href && (
          <IconLink href={href} icon={githubIcon} label="View repository" />
        )}
        {demo && <IconLink href={demo} icon={rocketIcon} label="Demo" />}
      </div>
    </article>
  )
}

export default ProjectCard
