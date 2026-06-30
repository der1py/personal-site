function Section({ id, title, headingLevel = 'h2', children }) {
  const Heading = headingLevel

  return (
    <section className="section" id={id} aria-labelledby={`${id}-title`}>
      <Heading id={`${id}-title`}>{title}</Heading>
      {children}
    </section>
  )
}

export default Section
