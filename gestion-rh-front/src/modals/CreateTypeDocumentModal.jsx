import { useState } from "react";
import Button from "../components/common/Button";

const CreateTypeDocumentModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({
    nom: "",
    description: "",
    cible: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal">
      <h3>Créer un Document</h3>

      <label>Nom de document:</label>
      <input
        type="text"
        name="nom"
        placeholder="Nom de document"
        value={form.nom}
        onChange={handleChange}
      />

      <label>Cible:</label>
      <select name="cible" value={form.cible} onChange={handleChange}>
        <option value="">--Selectioner un cible--</option>
        <option value="salarie">salaries</option>
        <option value="stagiaire">stagiaires</option>
      </select>

      <label>Déscription:</label>
      <input
        type="text"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <Button onClick={() => onSubmit(form)}>Enregistrer</Button>
      <Button onClick={onClose} variant="danger">
        Annuler
      </Button>
    </div>
  );
};

export default CreateTypeDocumentModal;