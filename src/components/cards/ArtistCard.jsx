<article className="artist-card">
  <MediaFrame ratio="4 / 5">
    <img src={image} alt={name} />
  </MediaFrame>

  <div className="artist-card__body">
    <MetaLine items={[discipline, location]} />
    <h3>{name}</h3>
    <p>{excerpt}</p>
    <TagList tags={tags} />
  </div>
</article>