import { useState, useEffect } from "react";
import Button from "../components/common/Button";

const EditTypeDocumentModal = ({ data, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        nom: data.nom || "",
        description: data.description || "",
        cible: data.cible || "",
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal">
      <h3>Modifier le document</h3>
      
      <label>Nom: </label>
      <input
        type="text"
        name="nom"
        value={form.nom}
        onChange={handleChange}
      />

      <label>Description: </label>
      <input
        type="text"
        name="description"
        value={form.description}
        onChange={handleChange}
      />

      <label>Cible</label>
      <select name="cible" value={form.cible} onChange={handleChange}>
        <option value="">--Selectioner un cible--</option>
        <option value="salarie">salaries</option>
        <option value="stagiaire">stagiaires</option>
      </select>

      <Button onClick={() => onSubmit(form)}>Modifier</Button>
      <Button onClick={onClose} variant="danger">
        Annuler
      </Button>
    </div>
  );
};

export default EditTypeDocumentModal;