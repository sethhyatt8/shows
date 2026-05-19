import homeBlockFile from '../data/homeBlock.json'

type HomeBlockData = {
  enabled: boolean
  title: string
  body: string
  linkUrl: string
  linkLabel: string
}

const block = homeBlockFile as HomeBlockData

export function HomeBlock() {
  if (!block.enabled) return null

  const hasLink = block.linkUrl.trim() && block.linkLabel.trim()

  return (
    <section className="home-block" aria-labelledby="home-block-title">
      <div className="home-block__icon" aria-hidden>
        <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={40} height={40} />
      </div>
      <div className="home-block__text">
        <h2 id="home-block-title" className="home-block__title">
          {block.title}
        </h2>
        <p className="home-block__body">{block.body}</p>
        {hasLink ? (
          <a
            className="home-block__link"
            href={block.linkUrl}
            target="_blank"
            rel="noreferrer"
          >
            {block.linkLabel}
          </a>
        ) : null}
      </div>
    </section>
  )
}
