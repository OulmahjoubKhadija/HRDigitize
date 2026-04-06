export default function DemandeStatusBadge({ status }) {
  const colors = {
    en_attente: "orange",
    approuvee: "green",
    refusee: "red",
  };

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: "8px",
        color: "white",
        background: colors[status] || "gray",
      }}
    >
      {status}
    </span>
  );
}