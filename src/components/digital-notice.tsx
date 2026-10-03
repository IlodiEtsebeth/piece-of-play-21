export function DigitalNotice({ className = "" }: { className?: string }) {
  return (
    <div className={`text-sm text-foreground/70 space-y-1 ${className}`}>
      <p>
        <span className="font-semibold text-primary">Please note:</span> All resources are digital (PDF) and
        downloadable straight after purchase. Nothing is posted.
      </p>
      <p>
        <span className="font-semibold text-primary">Let wel:</span> Alle hulpmiddels is digitaal (PDF) en kan direk
        na aankoop afgelaai word. Niks word gepos nie.
      </p>
    </div>
  );
}
