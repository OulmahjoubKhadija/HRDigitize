import { useState } from "react";
import { updateDemande } from "../services/demande.service";

export default function EditDemandeModal({
  demande,
  onClose,
  onSuccess,
}) {
  const [commentaire, setCommentaire] = useState(
    demande.demandeur_commentaire || ""
  );

  const handleSubmit = async () => {
    await updateDemande(demande.id, {
      demandeur_commentaire: commentaire,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal">
      <h3>Modifier la demande</h3>

      <textarea
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
      />

      <button onClick={handleSubmit}>Enregistrer</button>
      <button onClick={onClose}>Annuler</button>
    </div>
  );
}