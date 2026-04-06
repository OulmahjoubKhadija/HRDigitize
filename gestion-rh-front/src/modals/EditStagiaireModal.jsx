import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { stagiaireService } from "../services/stagiaire.service";

export default function EditStagiaireModal({ stagiaire, onClose, updateStagiaireInState }) {
  const { user } = useAuth();
  const isRH = user?.role === "RH";
  const [form, setForm] = useState({
    cin: "",
    date_debut: "",
    date_fin: "",
    status: "",
    societe_id: "",
    service_id: "",
    encadrant_id: "",
  });

  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);
  const [encadrants, setEncadrants] = useState([]);

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

  // Load Encadrant
  useEffect(() => {
    if (!isRH) return;
  
    api.get("/salaries")
      .then(res => {
        console.log("ENCADRANTS FETCHED:", res.data.data);
        setEncadrants(res.data.data || []);
      })
      .catch(err => console.error("ENCADRANTS ERROR:", err));
  }, [isRH]);

  useEffect(() => {
    if (stagiaire) {
      setForm({
        cin: stagiaire.cin ?? "",
        date_debut: stagiaire.date_debut ?? "",
        date_fin: stagiaire.date_fin ?? "",
        status: stagiaire.status ?? "",
        societe_id: stagiaire.societe?.id ?? "",
        service_id: stagiaire.service?.id ?? "",
        encadrant_id: stagiaire.encadrant?.id ?? "",
      });
    }
  }, [stagiaire]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value === "" ? null : value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {};

    Object.entries(form).forEach(([key, value]) => {
      if (key === "encadrant_id" && user.role !== "RH") return;
      if (value !== null && value !== "") {
        payload[key] = value;
      }
    });

    const res = await stagiaireService.update(stagiaire.id, payload);

    updateStagiaireInState(res.data.data ?? res.data);
    onClose();
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err.response?.data || err);
  }
};



  return (
    <div className="modal">
      <div className="modal-box max-w-xl">
        <h2 className="text-xl font-bold mb-4">Modifier le stagiaire</h2>

        <form onSubmit={handleSubmit} className="space-y-2">

          <label>CIN :</label>
          <input
            type="text"
            name="cin"
            value={form.cin || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label>Date début:</label>
          <input
            type="date"
            name="date_debut"
            value={form.date_debut || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label>Date fin:</label>
          <input
            type="date"
            name="date_fin"
            value={form.date_fin || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label>Status:</label>
          <select
            name="status"
            value={form.status || ""}
            onChange={handleChange}
            className="input input-bordered w-full"
          >
            <option value="">--Choisir--</option>
            <option value="en-stage">En stage</option>
            <option value="fin-stage">Fin stage</option>
            <option value="interrompu">Interrompu</option>
            <option value="archive">Archive</option>
          </select>

          <label>Société:</label>
          <select
            name="societe_id"
            value={form.societe_id || ""}
            onChange={handleChange}
            className="input input-bordered w-full mb-2"
          >
            <option value="">Sélectionner une société</option>
            {societes.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>

          <label>Service:</label>
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

          {user.role === "RH" && (
            <>
              <label>Encadrant:</label>
              <select name="encadrant_id" value={form.encadrant_id} onChange={handleChange} required>
                <option value=""> Sélectionner un encadrant </option>
                {encadrants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </>
          )}

          <div className="text-right mt-4 space-x-2">
            <button type="button" className="btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
