/** Quiet ICAG reference. Not co-branding in the header. */
export function IcagTrust({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`icag-trust ${compact ? "icag-trust--compact" : ""}`}>
      <img src="/icag-logo.png" alt="Institute of Chartered Accountants Ghana" />
    </div>
  );
}
