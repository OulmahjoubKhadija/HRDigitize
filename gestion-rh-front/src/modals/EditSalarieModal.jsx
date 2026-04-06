import { useState, useEffect } from "react";
import api from "../api/axios";
import { salarieService } from "../services/salarie.service";

export default function EditSalarieModal({ salarie, onClose, updateSalarieInState }) {
  const [form, setForm] = useState({
    profession: "",
    role: "",
    societe_id: "",
    service_id: "",
    status: "",
    date_embauche: "",
    cin:"",
    adresse: "",
    date_naissance: "",
    gsm: "",
    etat: "",
    salaire: "",
    situation_familiale: "",
    nbre_enfants: "",
    adresse_agence: "",
    rib: "",
    cnss: "",
  });

  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);

  // Load societes
  useEffect(() => {
    api.get("/societe")
      .then(res => setSocietes(res.data.data ?? res.data))
      .catch(err => console.error("Erreur societes:", err));
  }, []);

  // Load services when a societe is selected
  useEffect(() => {
    if (!form.societe_id) {
      setServices([]);
      setForm(prev => ({ ...prev, service_id: "" }));
      return;
    }

    api.get(`/service/societe/${form.societe_id}`)
      .then(res => setServices(res.data.data ?? res.data))
      .catch(err => console.error("Erreur services:", err));
  }, [form.societe_id]);

  // Initialize form when modal opens
  useEffect(() => {
    if (salarie) {
      setForm({
        profession: salarie.profession || "",
        role: salarie.role || "",
        societe_id: salarie.societe_id || "",
        service_id: salarie.service_id || "",
        status: salarie.status || "",
        date_embauche: salarie.date_embauche || "",

        cin: salarie.cin || "",
        adresse: salarie.adresse || "",
        date_naissance: salarie.date_naissance || "",
        gsm: salarie.gsm || "",
        etat: salarie.etat || "",
        salaire: salarie.salaire || "",
        situation_familiale: salarie.situation_familiale || "",
        nbre_enfants: salarie.nbre_enfants || "",
        adresse_agence: salarie.adresse_agence || "",
        rib: salarie.rib || "",
        cnss: salarie.cnss || "",
        banque: salarie.banque || "",
      });
    }
  }, [salarie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value === "" ? null : value, 
      ...(name === "societe_id" && { service_id: null }) 
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {};

    Object.keys(form).forEach(key => {
      const formValue = form[key];
      const currentValue = salarie[key] ?? null;

      // Only include fields RH can update
      if ([
        'profession',
        'role',
        'societe_id',
        'service_id',
        'status',
        'date_embauche',
        'cin',
        'adresse',
        'date_naissance',
        'gsm',
        'etat',
        'salaire',
        'situation_familiale',
        'nbre_enfants',
        'banque',
        'adresse_agence',
        'rib',
        'cnss'
      ].includes(key))
    {

        // Convert empty strings to null
        const valueToSend = formValue === "" ? null : formValue;

        // Include field if different or if user intentionally cleared it
        if (valueToSend !== currentValue) {
          // Fix status value (replace dash with underscore)
          if (key === "status" && valueToSend) {
            payload[key] = valueToSend.replace("-", "_");
          } else {
            payload[key] = valueToSend;
          }
        }
      }
    });

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }

    const res = await salarieService.update(salarie.id, payload);
    updateSalarieInState(res.data.data ?? res.data);
    onClose();
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err.response?.data || err);
  }
};



  if (!salarie) return null;

  return (
    <div className="modal">
      <div className="modal-box">
        <h2 className="text-xl font-bold mb-4">Modifier Salarié</h2>

        <label>Profession</label>
        <input
          name="profession"
          value={form.profession || ""}
          onChange={handleChange}
          placeholder="Profession"
          className="input input-bordered w-full mb-2"
        />

        <label>Rôle</label>
        <select name="role" value={form.role || ""} onChange={handleChange} className="input input-bordered w-full mb-2">
          <option value="">Sélectionner un rôle</option>
          <option value="SALARIE">Salarié</option>
          <option value="RH">RH</option>
          <option value="CHEF_SERVICE">Chef de service</option>
        </select>

        <label>CIN</label>
        <input
          name="cin"
          value={form.cin || ""}
          onChange={handleChange}
          placeholder="CIN"
          className="input input-bordered w-full mb-2"
        />

        <label>CNSS</label>
        <input
          name="cnss"
          value={form.cnss || ""}
          onChange={handleChange}
          placeholder="CNSS"
          className="input input-bordered w-full mb-2"
        />

        <label>Date de naissance</label>
        <input type="date"
        name="date_naissance"
        value={form.date_naissance || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />

        <label>N° de GSM </label>
        <input type="text"
        name="gsm"
        value={form.gsm || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />

        <label>Situation familiale</label>
        <select  
        name="situation_familiale"
        value={form.situation_familiale || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        >
          <option value="Célibataire">Célibataire</option>
          <option value="Marié(e)">Marié(e)</option>
          <option value="Divorcé(e)">Divorcé(e)</option>
          <option value="Veuf/Veuve">Veuf/Veuve</option>
        </select>
 
        <label>Nombre d'enfants </label>
        <input type="number" 
        name="nbre_enfants" min="0" step="1" 
        value={form.nbre_enfants || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />

        <label>Adresse</label>
        <input type="text" 
        name="adresse"
        value={form.adresse || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />
        
        <label>Date d'embauche</label>
        <input
          type="date"
          name="date_embauche"
          value={form.date_embauche || ""}
          onChange={handleChange}
          className="input input-bordered w-full mb-2"
        />

        <label>Société</label>
        <select
          name="societe_id"
          value={form.societe_id || ""}
          onChange={handleChange}
          className="input input-bordered w-full mb-2"
        >
          <option value="">Sélectionner une société</option>
          {societes.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>

        <label>Service</label>
        <select
          name="service_id"
          value={form.service_id || ""}
          onChange={handleChange}
          disabled={!form.societe_id}
          className="input input-bordered w-full mb-2"
        >
          <option value="">Sélectionner un service</option>
          {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
  
        <label>Banque </label>
        <input type="text"
        name="banque"
        value={form.banque || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />  

        <label>Adresse d'agence </label>
        <input type="text"
        name="adresse_agence"
        value={form.adresse_agence || ""}
        onChange={handleChange}
        className="input input-bordered w-full mb-2"
        />

        <label>RIB </label>
        <input
          type="text"
          name="rib"
          value={form.rib || ""}
          onChange={handleChange}
          className="input input-bordered w-full mb-2"
        />

        <label>Type de contrat</label>
        <select
          name="etat"
          value={form.etat || ""}
          onChange={handleChange}
          className="input input-bordered w-full mb-2"
        >
            <option value="">Sélectionner une etat</option>
            <option value="CDI">CDI</option>
            <option value="ANAPEC">ANAPEC</option>
        </select>

        <label>Status</label>
        <select
          name="status"
          value={form.status || ""}
          onChange={handleChange}
          className="input input-bordered w-full mb-2"
        >
          <option value="">Sélectionner un statut</option>
          <option value="Actif">Actif</option>
          <option value="En congé">En congé</option>
          <option value="Suspendu">Suspendu</option>
          <option value="Démissionné">Démissioné</option>
          <option value="Archivé">Archivé</option>
          <option value="Licencié">Licencié</option>
        </select>

        <div className="text-right mt-4">
          <button className="btn mr-2" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}