import { useState, useEffect } from "react"; 
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "./InternForm.css";

export default function InternForm() {
  const { user } = useAuth();
  const isRH = user?.role === "RH";

  const [formData, setFormData] = useState({
    cin: "",
    nom: "",
    prenom: "",
    email: "",
    date_debut_stage: "",
    date_fin_stage: "",
    encadrant_id: "",
    societe_id: "",
    service_id: "",
  });

  const [encadrants, setEncadrants] = useState([]);
  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const [authLoading, setAuthLoading] = useState(true);

  /** Wait for auth to load */
  useEffect(() => {
    if (user) setAuthLoading(false);
  }, [user]);

  /** Fetch societes */
  useEffect(() => {
    api.get("/societe")
      .then(res => {
        console.log("SOCIETES FETCHED:", res.data);
        setSocietes(res.data.data ?? res.data);
      })
      .catch(err => console.error("SOCIETES ERROR:", err));
  }, []);

  /** Fetch encadrants (RH only) */
  useEffect(() => {
    if (!isRH) return;

    api.get("/salaries")
      .then(res => {
        console.log("ENCADRANTS FETCHED:", res.data.data);
        setEncadrants(res.data.data || []);
      })
      .catch(err => console.error("ENCADRANTS ERROR:", err));
  }, [isRH]);

  /** Fetch services based on societe */
  useEffect(() => {
    if (!formData.societe_id) {
      setServices([]);
      setFormData(prev => ({ ...prev, service_id: "" }));
      return;
    }

    api.get(`/service/societe/${formData.societe_id}`)
      .then(res => {
        console.log("SERVICES FETCHED:", res.data);
        setServices(res.data || []);
      })
      .catch(err => console.error("SERVICES ERROR:", err));
  }, [formData.societe_id]);

  /** Handle input changes */
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /** Handle form submit */
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    console.log("SUBMIT CLICKED, USER:", user);

    if (!user) {
      console.warn("User not loaded yet!");
      setLoading(false);
      return;
    }

    const encadrantId = isRH ? formData.encadrant_id : user.salarie_id;

    if (!encadrantId) {
      setErrors({ global: "Votre compte n’est pas lié à un profil salarié." });
      setLoading(false);
      return;
    }

    const payload = {
      cin: formData.cin.trim(),
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim(),
      date_debut: formData.date_debut_stage || null,
      date_fin: formData.date_fin_stage || null,
      societe_id: formData.societe_id,
      service_id: formData.service_id,
      encadrant_id: encadrantId,
    };

    console.log("PAYLOAD:", payload);

    try {
      const response = await api.post("/stagiaires", payload);
      console.log("CREATE STAGIAIRE RESPONSE:", response.data);
      setSuccess("Le stagiaire créé avec succès !");
      setFormData({
        cin: "",
        nom: "",
        prenom: "",
        email: "",
        date_debut_stage: "",
        date_fin_stage: "",
        encadrant_id: "",
        societe_id: "",
        service_id: "",
      });
      setServices([]);
    } catch (err) {
      console.error("CREATE STAGIAIRE ERROR:", err);
      console.error("BACKEND RESPONSE:", err.response);

      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { global: err.response.data.message });
      } else if (err.response?.status === 403) {
        setErrors({ global: err.response.data.message || "Accès refusé." });
      } else {
        setErrors({
          global:
            err.response?.data?.message ||
            "Une erreur est survenue lors de la création du stagiaire.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Chargement de l'utilisateur...</div>;
  }

  return (
    <div className="intern-form-page">
      <div className="intern-form-container">
        <div className="intern-form-header">
          <h2>Créer un Nouveau Stagiaire</h2>
          <p>Remplissez les informations ci-dessous pour ajouter un nouveau stagiaire.</p>
        </div>

        <form onSubmit={handleSubmit} className="intern-form">
          {errors.global && <div className="intern-form-global-error">{errors.global}</div>}
          {success && <div className="intern-form-success">{success}</div>}

          <div className="intern-form-grid">

            <div className="intern-input-group">
              <label className="intern-required-field">CIN</label>
              <input type="text" name="cin" value={formData.cin} onChange={handleChange} required />
              {errors.cin && <span className="intern-form-error">{errors.cin}</span>}
            </div>

            <div className="intern-input-group">
              <label className="intern-required-field">Nom</label>
              <input name="nom" value={formData.nom} onChange={handleChange} required />
              {errors.nom && <span className="intern-form-error">{errors.nom}</span>}
            </div>

            <div className="intern-input-group">
              <label className="intern-required-field">Prénom</label>
              <input name="prenom" value={formData.prenom} onChange={handleChange} required />
              {errors.prenom && <span className="intern-form-error">{errors.prenom}</span>}
            </div>

            <div className="intern-input-group">
              <label className="intern-required-field">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              {errors.email && <span className="intern-form-error">{errors.email}</span>}
            </div>

            <div className="intern-input-group">
              <label>Date de début</label>
              <input type="date" name="date_debut_stage" value={formData.date_debut_stage} onChange={handleChange} />
            </div>

            <div className="intern-input-group">
              <label>Date de fin</label>
              <input type="date" name="date_fin_stage" value={formData.date_fin_stage} onChange={handleChange} />
            </div>
          </div>

          <div className="intern-form-grid">
            <div className="intern-input-group">
              <label className="intern-required-field">Société</label>
              <select name="societe_id" value={formData.societe_id} onChange={handleChange} required>
                <option value="">-- Sélectionner une société --</option>
                {societes.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>

            <div className="intern-input-group">
              <label className="intern-required-field">Service</label>
              <select name="service_id" value={formData.service_id} onChange={handleChange} required disabled={!formData.societe_id}>
                <option value="">-- Sélectionner un service --</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
          </div>

          {isRH && (
            <div className="intern-input-group">
              <label className="intern-required-field">Encadrant</label>
              <select name="encadrant_id" value={formData.encadrant_id} onChange={handleChange} required>
                <option value="">-- Sélectionner un encadrant --</option>
                {encadrants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={loading || authLoading} className="intern-submit-btn">
            {loading ? "Création en cours..." : "Créer le stagiaire"}
          </button>
        </form>
      </div>
    </div>
  );
}
