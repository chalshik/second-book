export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl mx-auto px-5 py-12">{children}</div>;
}
