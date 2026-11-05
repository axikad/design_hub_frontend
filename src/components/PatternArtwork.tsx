export function PatternArtwork({ variant = 0, className = '' }: { variant?: number; className?: string }) {
  return <div className={`pattern-art pattern-${variant % 4} ${className}`} aria-hidden="true"><span className="pattern-orbit orbit-a" /><span className="pattern-orbit orbit-b" /><span className="pattern-flower flower-a">✦</span><span className="pattern-flower flower-b">✤</span><span className="pattern-flower flower-c">✦</span></div>
}
