import { useState } from "react";
import { updateDemande } from "../services/demande.service";

export default function ValidateDemandeModal({
  demande,
  onClose,
  onSuccess,
}) {
  const [status, setStatus] = useState("approuvee");
  const [commentaire, setCommentaire] = useState("");

  const handleSubmit = async () => {
    await updateDemande(demande.id, {
      status,
      commentaire_rh: commentaire,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="modal">
      <h3>Valider la demande</h3>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="approuvee">Approuver</option>
        <option value="refusee">Refuser</option>
      </select>

      <textarea
        placeholder="Commentaire RH"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
      />

      <button onClick={handleSubmit}>Confirmer</button>
      <button onClick={onClose}>Annuler</button>
    </div>
  );
}