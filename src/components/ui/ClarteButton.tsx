import type { MouseEventHandler } from 'react'
import { textStyles } from '../../styles/tokens'

interface ClarteButtonProps {
  label: string
  href: string
  className?: string
  fullWidth?: boolean
  stretch?: boolean
  target?: string
  rel?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export default function ClarteButton({
  label,
  href,
  className,
  fullWidth = false,
  stretch = false,
  target,
  rel,
  onClick,
}: ClarteButtonProps) {
  return (
    <a
      href={href}
      className={`clarte-button${className ? ` ${className}` : ''}`}
      target={target}
      rel={rel}
      onClick={onClick}
      style={{
        ...textStyles.bodyMedium,
        alignSelf: stretch ? 'stretch' : 'flex-start',
        width: fullWidth ? '100%' : undefined,
      }}
    >
      <span className="clarte-button-bg" aria-hidden="true" />
      <span className="clarte-button-text-wrap">
        <span className="clarte-button-text">{label}</span>
        <span className="clarte-button-text clarte-button-text-clone" aria-hidden="true">
          {label}
        </span>
      </span>
      <span className="clarte-button-arrow-wrap" aria-hidden="true">
        <span className="clarte-button-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="9,2 15,8 9,14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="clarte-button-arrow clarte-button-arrow-clone">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="9,2 15,8 9,14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </a>
  )
}