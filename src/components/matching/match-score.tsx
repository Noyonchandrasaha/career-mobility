export function MatchScore({
  score,
  large = false,
}: {
  score: number
  large?: boolean
}) {
  return (
    <div
      role="img"
      aria-label={`Profile match: ${score} out of 100`}
      className={large ? "space-y-2" : "shrink-0 text-right"}
    >
      <p className="text-xs text-muted-foreground">Profile match</p>
      <p
        className={
          large
            ? "text-5xl font-semibold tracking-tight text-primary"
            : "text-3xl font-semibold tracking-tight text-primary"
        }
      >
        {score}
        <span className="text-base">%</span>
      </p>
    </div>
  )
}
