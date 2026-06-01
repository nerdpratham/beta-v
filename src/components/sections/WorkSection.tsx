// ─── WORK SECTION — SixDX ─────────────────────────────────────────────────────
// Figma node: 323:118  /  "Work"
//
// To add / remove / edit projects — change the PROJECTS array only.
// Cards use VideoDistortionCard: video paused at first frame, wave-distortion
// reveal + mouse ripple on hover.
// ─────────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'
import VideoDistortionCard from '../ui/VideoDistortionCard'
import type { VideoDistortionCardProps } from '../ui/VideoDistortionCard'
import { colors, textStyles } from '../../styles/tokens'

// ── Content ───────────────────────────────────────────────────────────────────

const HEADING  = 'The Work'
const SUBTITLE = 'Three environments. Three industries. Each built from client site documentation.'

const PROJECTS: VideoDistortionCardProps[][] = [
  [
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287936/ABB_mini01_uavm3b.mp4', title: 'Integrated Mill Furnace Floor', tag: 'Steel'     },
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287265/vid_2_myerzi.mp4',      title: 'Shutdown Procedure',            tag: 'Oil & Gas' },
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287265/vid_3_x54bll.mp4',      title: 'Hall Isolation',                tag: 'Oil & Gas' },
  ],
  [
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287275/vid_4_y7izvf.mp4',      title: 'Integrated Mill Furnace Floor', tag: 'Steel'     },
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287266/vid_5_df5pnu.mp4',      title: 'Shutdown Procedure',            tag: 'Oil & Gas' },
    { videoSrc: 'https://res.cloudinary.com/dj5sqxkpj/video/upload/v1780287263/vid_1_f6goo6.mp4',      title: 'Hall Isolation',                tag: 'Oil & Gas' },
  ],
]

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  section: {
    background:    colors.white,
    padding:       '100px 28px',
    display:       'flex',
    flexDirection: 'column',
    gap:           60,
    width:         '100%',
    boxSizing:     'border-box',
  } satisfies CSSProperties,

  header: {
    display:        'flex',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
    width:          '100%',
  } satisfies CSSProperties,

  heading: {
    ...textStyles.h2,
    color:      colors.ink,
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  subtitle: {
    ...textStyles.h3,
    color:      colors.ink,
    width:      443,
    flexShrink: 0,
  } satisfies CSSProperties,

  grid: {
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
    width:         '100%',
  } satisfies CSSProperties,

  row: {
    display: 'flex',
    gap:     12,
    width:   '100%',
  } satisfies CSSProperties,
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function WorkSection() {
  return (
    <section aria-label="The Work" data-theme="light" className="work-section" style={s.section}>

      <div className="work-header" style={s.header}>
        <h2 style={s.heading}>{HEADING}</h2>
        <p className="work-subtitle" style={s.subtitle}>{SUBTITLE}</p>
      </div>

      <div style={s.grid}>
        {PROJECTS.map((row, ri) => (
          <div key={ri} className="work-row" style={s.row}>
            {row.map((cardProps, ci) => (
              <VideoDistortionCard key={`${ri}-${ci}`} {...cardProps} />
            ))}
          </div>
        ))}
      </div>

    </section>
  )
}
