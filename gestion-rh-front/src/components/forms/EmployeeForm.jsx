import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./EmployeeForm.css"; 

export default function EmployeeForm() {
  const [formData, setFormData] = useState({
    cin: "",
    cnss: "",
    prenom: "",
    nom: "",
    email: "",
    date_naissance: "",
    adresse: "",
    gsm: "",
    etat: "",
    salaire: "",
    situation_familiale: "",
    nbre_enfants: "",
    banque: "",
    adresse_agence: "",
    rib: "",
    role: "SALARIE",
    societe_id: "",
    service_id: "",
    profession: "",
    date_embauche: "",
  });

  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =======================
     Fetch societes on mount
     ======================= */
  useEffect(() => {
    api.get("/societe")
      .then(res => setSocietes(res.data.data ?? res.data))
      .catch(err => {
        console.error("Erreur societes:", err);
        setError("Impossible de charger la liste des sociétés");
      });
  }, []);

  /* ==========================
     Fetch services by societe
     ========================== */
  useEffect(() => {
    if (!formData.societe_id) {
      setServices([]);
      setFormData(prev => ({ ...prev, service_id: "" }));
      return;
    }

    api.get(`/service/societe/${formData.societe_id}`)
      .then(res => setServices(res.data.data ?? res.data))
      .catch(err => {
        console.error("Erreur services:", err);
        setError("Impossible de charger la liste des services");
      });
  }, [formData.societe_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ===================
     Submit form
     =================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const employeeData = {
        cin: formData.cin,
        cnss: formData.cnss,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        date_naissance: formData.date_naissance || null,
        adresse: formData.adresse || null,
        gsm: formData.gsm || null,
        etat: formData.etat || null,
        salaire: formData.salaire || null,
        situation_familiale: formData.situation_familiale || null,
        nbre_enfants: formData.nbre_enfants || null,
        banque: formData.banque,
        adresse_agence: formData.adresse_agence || null,
        rib: formData.rib || null,
        role: formData.role,
        societe_id: formData.societe_id,
        service_id: formData.service_id,
        profession: formData.profession || null,
        date_embauche: formData.date_embauche || null,
      };

      await api.post("/salaries", employeeData);
      
      setSuccess("Employé créé avec succès !");

      // Reset form
      setFormData({
        cin: "",
        cnss: "",
        prenom: "",
        nom: "",
        email: "",
        date_naissance: "",
        adresse: "",
        gsm: "",
        etat: "",
        salaire: "",
        situation_familiale: "",
        nbre_enfants: "",
        banque: "",
        adresse_agence: "",
        rib: "",
        role: "SALARIE",
        societe_id: "",
        service_id: "",
        profession: "",
        date_embauche: "",
      });
      setServices([]);

    } catch (err) {
      console.error("Erreur création:", err.response?.data);
      setError(err.response?.data?.message || "Erreur lors de la création de l'employé");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form-page">
      {/* Messages Container - Placed above the form */}
      {(success || error) && (
        <div className="employee-messages-container">
          {success && (
            <div className="employee-success-message">
              <div className="employee-success-message-content">
                {success}
              </div>
              <button 
                className="employee-success-message-close"
                onClick={() => setSuccess('')}
                aria-label="Fermer le message"
              >
                ×
              </button>
            </div>
          )}
          
          {error && (
            <div className="employee-error-message">
              <div className="employee-error-message-content">
                {error}
              </div>
              <button 
                className="employee-error-message-close"
                onClick={() => setError('')}
                aria-label="Fermer le message"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
      <div className="employee-form-container">
        <div className="employee-form-header">
          <h2>Créer un Nouvel Employé</h2>
          <p>Remplissez les informations ci-dessous pour ajouter un nouvel employé au système.</p>
        </div>

        <form onSubmit={handleSubmit} className="employee-form">

          {/* Personal Information Grid */}
          <div className="employee-form-grid">
            {/* Prénom */}
            <div className="employee-input-group">
              <label htmlFor="prenom" className="employee-required-field">Prénom</label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>

            {/* Nom */}
            <div className="employee-input-group">
              <label htmlFor="nom" className="employee-required-field">Nom</label>
              <input
                id="nom"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div className="employee-input-group">
              <label htmlFor="email" className="employee-required-field">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Cin */}
            <div className="employee-input-group">
              <label htmlFor="cin" className="employee-required-field">CIN</label>
              <input
                id="cin"
                type="text"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                required
              />
            </div>

            {/* CNSS */}
            <div className="employee-input-group">
              <label htmlFor="cnss" className="employee-required-field">CNSS</label>
              <input
                id="cnss"
                type="text"
                name="cnss"
                value={formData.cnss}
                onChange={handleChange}
                required
              />
            </div>

            {/* GSM */}
            <div className="employee-input-group">
              <label htmlFor="gsm"> N° de GSM </label>
              <input
                id="gsm"
                type="text"
                name="gsm"
                value={formData.gsm}
                onChange={handleChange}
              />
            </div>

            {/* Date de naissance */}
            <div className="employee-input-group">
              <label htmlFor="date_naissance">Date de naissance</label>
              <input
                id="date_naissance"
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
              />
            </div>

            {/* Situation familiale */}
            <div className="employee-input-group">
              <label htmlFor="situation_familiale">Situation familiale</label>
              <select
                id="situation_familiale"
                name="situation_familiale"
                value={formData.situation_familiale}
                onChange={handleChange}
                className="employee-role-select"
              >
                <option value="">--Selectioner une situation--</option>
                <option value="Célibataire">Célibataire</option>
                <option value="Marié(e)">Marié(e)</option>
                <option value="Divorcé(e)">Divorcé(e)</option>
                <option value="Veuf/Veuve">Veuf/Veuve</option>
              </select>
            </div>
         
            {/* Nombre d'enfants */}
            <div className="employee-input-group">
              <label htmlFor="nbre_enfants"> Nombre d'enfants </label>
              <input
                id="nbre_enfants"
                type="number" min="0" step="1"
                name="nbre_enfants"
                value={formData.nbre_enfants}
                onChange={handleChange}
              />
            </div>
            
            {/* Role */}
            <div className="employee-input-group">
              <label htmlFor="role" className="employee-required-field">Rôle</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="employee-role-select"
              >
                <option value="SALARIE">SALARIÉ</option>
                <option value="CHEF_SERVICE">CHEF DE SERVICE</option>
                <option value="RH">RESOURCES HUMAINES</option>
              </select>
            </div>
          </div>

          {/* Organization Section */}
          <div className="organization-section">
            <h3 className="organization-section-title">Informations Organisationnelles</h3>
            
            <div className="employee-form-grid">
              {/* Société */}
              <div className="employee-input-group">
                <label htmlFor="societe_id" className="employee-required-field">Société</label>
                <select
                  id="societe_id"
                  name="societe_id"
                  value={formData.societe_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner une société --</option>
                  {societes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div className="employee-input-group">
                <label htmlFor="service_id" className="employee-required-field">Service</label>
                <select
                  id="service_id"
                  name="service_id"
                  value={formData.service_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.societe_id}
                >
                  <option value="">-- Sélectionner un service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
                {!formData.societe_id && (
                  <small className="employee-select-hint">Sélectionnez d'abord une société</small>
                )}
              </div>

              {/* profession */}
              <div className="employee-input-group">
                <label htmlFor="profession">
                  Profession 
                </label>
                <input
                  id="profession"
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
              </div>

              {/* Date d'embauche */}
              <div className="employee-input-group">
                <label htmlFor="date_embauche">
                  Date d'embauche
                </label>
                <input
                  id="date_embauche"
                  type="date"
                  name="date_embauche"
                  value={formData.date_embauche}
                  onChange={handleChange}
                />
              </div>

            {/* Etat*/}
            <div className="employee-input-group">
              <label htmlFor="etat">Type de contrat </label>
              <select
                id="etat"
                name="etat"
                value={formData.etat}
                onChange={handleChange}
                className="employee-role-select"
              >
                <option value="">--Selectioner une etat--</option>
                <option value="CDI">CDI</option>
                <option value="ANAPEC">ANAPEC</option>
              </select>
            </div>

            {/* Banque */}
            <div className="employee-input-group">
              <label htmlFor="banque"> Banque </label>
              <input
                id="banque"
                type="text"
                name="banque"
                value={formData.banque}
                onChange={handleChange}
              />
            </div> 

            {/* Adresse d'agence */}
            <div className="employee-input-group">
              <label htmlFor="adresse_agence"> Adresse d'agence </label>
              <input
                id="adresse_agence"
                type="text"
                name="adresse_agence"
                value={formData.adresse_agence}
                onChange={handleChange}
              />
            </div>

            {/* RIB */}
            <div className="employee-input-group">
              <label htmlFor="rib"> RIB </label>
              <input
                id="salaire"
                type="text" 
                name="rib"
                value={formData.rib}
                onChange={handleChange}
              />
            </div> 

            {/* Salaire */}
            <div className="employee-input-group">
              <label htmlFor="salaire"> Salaire </label>
              <input
                id="salaire"
                type="number" min="0" step="0.01"
                name="salaire"
                value={formData.salaire}
                onChange={handleChange}
              />
            </div>

            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading} 
            className="employee-submit-btn"
          >
            {loading ? (
              <>
                <span className="employee-loading-spinner"></span>
                Création en cours...
              </>
            ) : "Créer l'employé"}
          </button>
        </form>
      </div>
    </div>
  );
}