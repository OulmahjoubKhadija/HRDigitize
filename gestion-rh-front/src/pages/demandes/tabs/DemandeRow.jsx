import DemandeStatusBadge from "./DemandeStatusBadge";

export default function DemandeRow({
  demande,
  user,
  isRH,
  onValidate,
  onEdit,
  onDownload,
}) {
  const isOwner = user.id === demande.user_id;

  return (
    <tr>
      <td>{demande.user?.name}</td>
      <td>{demande.type_document?.nom}</td>

      <td>
        <DemandeStatusBadge status={demande.status} />
      </td>

      <td>{demande.demandeur_commentaire}</td>

      <td>{demande.commentaire_rh}</td>

      <td>
        {(isRH || isOwner) && demande.file_path && (
          <button onClick={() => onDownload(demande.id)}>
            Télécharger
          </button>
        )}

        {isRH && demande.status === "en_attente" && (
          <button onClick={() => onValidate(demande)}>
            Valider
          </button>
        )}

        {isOwner && demande.status === "en_attente" && (
          <button onClick={() => onEdit(demande)}>
            Modifier
          </button>
        )}
      </td>
    </tr>
  );
}