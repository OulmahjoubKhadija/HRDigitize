import { useState, useEffect } from "react";
import Button from "../components/common/Button";
import { getTypeDocuments } from "../services/typeDocument.service";

const CreateDocumentTemplateModal = ({ onClose, onSubmit }) => {
  const [typeDocuments, setTypeDocuments] = useState([]);
  const [form, setForm] = useState({
    type_document_id: "",
    template_path: null,
    roles_autorises: [],
    variable_json: [""],
  });

  useEffect(() => {
    getTypeDocuments().then((res) => setTypeDocuments(res.data.data || []));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else if (type === "checkbox") {
      let updated = [...form[name]];
      if (checked) updated.push(value);
      else updated = updated.filter((v) => v !== value);
      setForm({ ...form, [name]: updated });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleVariableChange = (index, value) => {
    const updated = [...form.variable_json];
    updated[index] = value;
    setForm({ ...form, variable_json: updated });
    };

    const addVariable = () => {
        const lastVariable =
        form.variable_json[form.variable_json.length - 1];

    if (lastVariable.trim() === "") return;

    setForm({
        ...form,
        variable_json: [...form.variable_json, ""],
    });
    };

    const removeVariable = (index) => {
    const updated = form.variable_json.filter((_, i) => i !== index);
    setForm({ ...form, variable_json: updated });
    };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("type_document_id", form.type_document_id);
    if (form.template_path) formData.append("template_path", form.template_path);
    form.roles_autorises.forEach((r) => formData.append("roles_autorises[]", r));
    form.variable_json
    .map((v) => v.trim())              
    .filter((v) => v !== "")           
    .forEach((v) =>
      formData.append("variable_json[]", v)
    );

  onSubmit(formData);
  };

  return (
    <div className="modal">
      <h3>Créer un modèle de document</h3>

      <label>Type de document</label>
      <select name="type_document_id" value={form.type_document_id} onChange={handleChange}>
        <option value="">--Select--</option>
        {typeDocuments.map((t) => (
          <option key={t.id} value={t.id}>{t.nom}</option>
        ))}
      </select>

      <label>Fichier modèle (.docx)</label>
      <input type="file" name="template_path" onChange={handleChange} />

      <label>Roles Autorisés</label>
      {["RH","SALARIE","CHEF_SERVICE","STAGIAIRE"].map((role) => (
        <div key={role}>
          <input type="checkbox" value={role} name="roles_autorises" onChange={handleChange} />
          {role}
        </div>
      ))}

        <label>Variables</label>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "400px" }}>
            {form.variable_json.map((variable, index) => (
                <div
                key={index}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
                >
                <input
                    type="text"
                    value={variable}
                    placeholder="Saisissez la variable"
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    }}
                />

                {form.variable_json.length > 1 && (
                    <Button
                    type="button"
                    onClick={() => removeVariable(index)}
                    variant="danger"
                    >
                    -
                    </Button>
                )}
                </div>
            ))}
            </div>

        <Button type="button" onClick={addVariable}>
        + Ajouter une variable
        </Button>

      <Button onClick={handleSubmit}>Enregistrer</Button>
      <Button onClick={onClose} variant="danger">Annuler</Button>
    </div>
  );
};

export default CreateDocumentTemplateModal;