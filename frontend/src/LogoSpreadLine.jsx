/**
 * One line of text with letters spaced so the line fills the full width
 * (left and right edges align with other lines in the same column).
 */
export function LogoSpreadLine({ className, text }) {
  return (
    <span className={className} aria-hidden="true">
      {String(text).split('').map((ch, i) => (
        <span className="logo-spread-char" key={i}>
          {ch}
        </span>
      ))}
    </span>
  )
}
