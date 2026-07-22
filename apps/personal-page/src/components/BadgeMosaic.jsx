import certifications from '../data/certifications.json'

const badgeCerts = certifications.certifications.filter(
  (c) => c.hasCertificate && c.badgeImageUrl
)

export default function BadgeMosaic() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-around py-20" style={{ top: '64px' }}>
      {[
        badgeCerts.slice(0, 5),   // row 0 — 5 badges
        badgeCerts.slice(5, 9),   // row 1 — 4 badges, shifted half a cell right
        badgeCerts.slice(9, 14),  // row 2 — 5 badges
      ].map((rowBadges, row) => (
        <div
          key={row}
          className="flex justify-center"
          style={{
            gap: '80px',
            transform: row === 1 ? 'translateX(40px)' : 'translateX(0)',
            opacity: 0.08,
          }}
        >
          {rowBadges.map((cert) => (
            <img
              key={cert.id}
              src={cert.badgeImageUrl}
              alt={cert.course}
              className="w-36 h-36 object-contain"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

