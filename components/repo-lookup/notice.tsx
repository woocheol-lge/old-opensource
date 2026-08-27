export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
    >
      {children}
    </p>
  );
}
