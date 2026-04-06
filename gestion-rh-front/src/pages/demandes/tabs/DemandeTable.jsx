import DemandeRow from "./DemandeRow";

export default function DemandeTable({
  demandes = [],
  user,
  isRH,
  onValidate,
  onEdit,
  onDownload,
}) {
  return (
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Type document</th>
          <th>Status</th>
          <th>Commentaire demandeur</th>
          <th>Commentaire RH</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {demandes.map((d) => (
          <DemandeRow
            key={d.id}
            demande={d}
            user={user}
            isRH={isRH}
            onValidate={onValidate}
            onEdit={onEdit}
            onDownload={onDownload}
          />
        ))}
      </tbody>
    </table>
  );
}