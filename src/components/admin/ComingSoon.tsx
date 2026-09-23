export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>{title}</h1>
      <div className="card" style={{ padding: 24, maxWidth: 560 }}>
        <p style={{ fontSize: 14, color: "var(--color-ink-soft)", lineHeight: 1.7 }}>{description}</p>
        <p style={{ fontSize: 12, color: "var(--color-ink-soft)", marginTop: 14 }}>
          The underlying database model already exists — this admin screen is scheduled for the next development
          pass. See the project README for the phase 2 roadmap.
        </p>
      </div>
    </div>
  );
}
