type WelcomeMessageLinkProps = {
  imgSrc: string
  title: string
  href: string
  target?: string
  onClick?: () => void
}

export default function WelcomeMessageLink({
  imgSrc,
  title,
  href,
  target,
  onClick,
}: WelcomeMessageLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="card welcome-message-card welcome-message-card-link"
      target={target || undefined}
      rel="noopener"
    >
      <p>{title}</p>
      <img
        className="welcome-message-card-img"
        src={imgSrc}
        alt={title}
        aria-hidden="true"
      />
    </a>
  )
}
