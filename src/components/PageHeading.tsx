/** Centered page or section heading with the short rule from the original site. */
export function PageHeading({
  title,
  intro,
  as: Tag = 'h1',
  id,
}: {
  title: string
  intro?: string | null
  as?: 'h1' | 'h2'
  id?: string
}) {
  return (
    <header className="section-heading">
      <Tag id={id}>{title}</Tag>
      {intro ? <p>{intro}</p> : null}
    </header>
  )
}
