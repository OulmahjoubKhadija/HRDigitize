import { useState, useEffect } from "react";  
import api from "../api/axios";
import "./MyProfile.css";
import { 
  FaUniversity,FaPhone, FaMapMarkerAlt, FaIdCard,FaEnvelope,
  FaBuilding, FaUserShield, FaLinkedin, FaGithub, FaFileAlt, FaCamera, 
  FaMoneyBillWave,
  FaCreditCard,
  FaUserFriends,
  FaBaby,
  FaBirthdayCake
} from "react-icons/fa";
import profile from "../assets/profile.webp";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function MyProfile() {
  const [salarie, setSalarie] = useState(null);
  const [editData, setEditData] = useState({});
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [societes, setSocietes] = useState([]);
  const [services, setServices] = useState([]);
  const [originalEmail, setOriginalEmail] = useState("");


  const backendURL = "http://localhost:8000";

  const fetchProfile = async () => {
    try {
  const res = await api.get("/me/employee");
  setSalarie(res.data.data);
} catch (err) {
  console.error(err.response?.data || err);
  alert("Impossible de récupérer votre profil. Contactez l'administrateur.");
}
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    api.get("/societe").then(res => setSocietes(res.data.data ?? res.data ?? []));
  }, []);

  useEffect(() => {
    if (!editData.societe_id) {
      setServices([]);
      return;
    }

    api
      .get(`/service/societe/${editData.societe_id}`)
      .then(res => setServices(res.data || []));
  }, [editData.societe_id]);

  if (!salarie) return <div className="profile-loading">Loading...</div>;

  const isRH = salarie.role === "RH";

  const handleChange = (field, value) => {
  setEditData(prev => ({
    ...prev,
    [field]: value,
  }));
};

  const handleSave = async () => {
  try {

    // EMAIL CONFIRMATION
    if (
      editData.email &&
      editData.email !== originalEmail
    ) {
      const confirmChange = window.confirm(
        "Êtes-vous sûr(e) de vouloir changer votre adresse email ?"
      );

      if (!confirmChange) {
        // User cancelled → revert email
        setEditData(prev => ({
          ...prev,
          email: originalEmail,
        }));
        return;
      }
    }

    const payload = { ...editData };

    // Remove files
    delete payload.photo;
    delete payload.cv;

    // Update text fields first
    const resText = await api.put("/me/employee", payload);

    // Then upload files separately if needed
    const fileData = new FormData();
    if (editData.photo) fileData.append("photo", editData.photo);
    if (editData.cv) fileData.append("cv", editData.cv);

    if (fileData.has("photo") || fileData.has("cv")) {
      fileData.append("_method", "PUT");
      await api.post("/me/employee", fileData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    setSalarie(resText.data.data);
    setShowEditPanel(false);

    // Inform user AFTER successful update
    if (editData.email !== originalEmail) {
      alert(
        "Votre email a été modifié. Vous devrez vous connecter avec la nouvelle adresse."
      );
      // Optional: force logout
       await api.post("/logout");
       window.location.href = "/login";
    }

  } catch (err) {
    console.error("Update failed:", err.response?.data || err);
  }
};


  const handleDelete = async (field) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer ${field} ?`)) return;

  try {
    const res = await api.post("/me/employee/delete", {
      [`delete_${field}`]: true,
    });

    console.log("DELETE RESPONSE:", res.data);
    setSalarie(res.data.data);
    setShowDeletePanel(false);
    setEditData(prev => ({ ...prev, [field]: null }));

    if (field === "photo") setPhotoPreview(null);

  } catch (err) {
    console.error(err.response?.data || err);
  }
};

const handlePhotoUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("_method", "PUT");

    const res = await api.post("/me/employee", formData);

    setSalarie(res.data.data); 
    setPhotoPreview(null);     
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Erreur lors de l'enregistrement de la photo");
  }
};


  return (
    <div className="profile-container">
      
      {/* =================== PROFILE DISPLAY =================== */}
      <div className="profile-card">
        {/* Avatar */}
        <div className="avatar-wrapper">
          <img
            src={ photoPreview
                ? photoPreview
                : salarie.photo
                ? backendURL + salarie.photo
                : profile
            }
            alt="Avatar"
            className="profile-avatar"
            onClick={() => setShowPreview(true)}
            onError={(e) => (e.target.src = profile)}
          />
          {/* Camera icon (UI only) */}
          <label className="camera-icon">
            <FaCamera />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPhotoPreview(URL.createObjectURL(file));
                  handlePhotoUpload(file);
                }
              }}
            />
          </label>
        </div>

        {/* Name */}
        <h2 className="profile-name">{salarie.prenom} {salarie.nom}</h2>

        {/* Info section (your original code untouched) */}
        <div className="profile-details-container">
          {salarie.societe && (
            <div className="profile-detail-item">
              <p className="profile-societe">{salarie.societe?.nom ?? "-"}</p>
              <label>Société</label>
            </div>
          )}
          {salarie.service && (
            <div className="profile-detail-item">
              <p className="profile-service">{salarie.service?.nom ?? "-"}</p>
              <label>Service</label>
            </div>
          )}
          {salarie.profession && (
            <div className="profile-detail-item">
              <p className="profile-poste">{salarie.profession}</p>
              <label>Profession</label>
            </div>
          )}
        </div>

        <div className="profile-info">
          {salarie.email && (
            <div className="profile-info-item">
              <FaEnvelope className="icon" />
              <span>{salarie.email}</span>
            </div>
          )}
          {salarie.gsm && (
            <div className="profile-info-item">
              <FaPhone className="icon" />
              <span>{salarie.gsm}</span>
            </div>
          )}
          {salarie.adresse && (
            <div className="profile-info-item">
              <FaMapMarkerAlt className="icon" />
              <span>{salarie.adresse}</span>
            </div>
          )}
          {salarie.cin && (
            <div className="profile-info-item">
              <FaIdCard className="icon" />
              <span>{salarie.cin}</span>
            </div>
          )}
          {salarie.date_naissance && (
            <div className="profile-info-item">
              <FaBirthdayCake className="icon" />
              <span>{salarie.date_naissance}</span>
            </div>
          )}
          {salarie.salaire && (
            <div className="profile-info-item">
              <FaMoneyBillWave className="icon" />
              <span>{salarie.salaire}</span>
            </div>
          )}
          {salarie.linkedin && (
            <div className="profile-info-item">
              <FaLinkedin className="icon" />
              <a href={salarie.linkedin} target="_blank" rel="noreferrer">
                {salarie.linkedin}
              </a>
            </div>
          )}
          {salarie.github && (
            <div className="profile-info-item">
              <FaGithub className="icon" />
              <a href={salarie.github} target="_blank" rel="noreferrer">
                {salarie.github}
              </a>
            </div>
          )}
          {salarie.cv && (
            <div className="profile-info-item">
              <FaFileAlt className="icon" />
              <a href={backendURL + salarie.cv} target="_blank" rel="noreferrer">
                Voir CV
              </a>
            </div>
          )}
        </div>

        {/* RH-only info */}
        {isRH && (
          <>
            <button
              className="show-more-btn"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "Masquer RH Info" : "Afficher RH Info"}
            </button>
            {showMore && (
              <div className="profile-more-info">
                
                {salarie.date_embauche && (
                  <>
                  <label className="profile-societe">Date d'embauche</label>
                  <div className="profile-info-item">
                    <FaBuilding className="icon" />
                    <span>{salarie.date_embauche}</span>
                  </div>
                  </>
                )}
                {salarie.status && (
                  <>
                  <label className="profile-societe">Statut</label>
                  <div className="profile-info-item">
                    <FaUserShield className="icon" />
                    <span>{salarie.status}</span>
                  </div>
                  </>
                )}
                {salarie.etat && (
                  <>
                  <label className="profile-societe">Type de contrat</label>
                  <div className="profile-info-item">
                    <HiOutlineDocumentText className="icon" />
                    <span>{salarie.etat}</span>
                  </div>
                  </>
                )}
                {salarie.cnss && (
                  <>
                  <label className="profile-societe">CNSS</label>
                  <div className="profile-info-item">
                    <FaUserShield className="icon" />
                    <span>{salarie.cnss}</span>
                  </div>
                  </>
                )}
                {salarie.banque && (
                  <>
                  <label className="profile-societe">Banque</label>
                  <div className="profile-info-item">
                    <FaUniversity className="icon" />
                    <span>{salarie.banque}</span>
                  </div>
                  </>
                )}
                {salarie.adresse_agence && (
                  <>
                  <label className="profile-societe">Adresse d'agence</label>
                  <div className="profile-info-item">
                    <FaMapMarkerAlt className="icon" />
                    <span>{salarie.adresse_agence}</span>
                  </div>
                  </>
                )}
                {salarie.rib && (
                  <>
                  <label className="profile-societe">RIB</label>
                  <div className="profile-info-item">
                    <FaCreditCard className="icon" />
                    <span>{salarie.rib}</span>
                  </div></>
                )}
                {salarie.situation_familiale && (
                  <>
                  <label className="profile-societe">Situation familiale</label>
                  <div className="profile-info-item">
                    <FaUserFriends className="icon" />
                    <span>{salarie.situation_familiale}</span>
                  </div>
                  </>
                )}
                {salarie.nbre_enfants && (
                  <>
                  <label className="profile-societe">Nombre d'enfants</label>
                  <div className="profile-info-item">
                    <FaBaby className="icon" />
                    <span>{salarie.nbre_enfants}</span>
                  </div>
                  </>
                )}
              </div>

            )}
          </>
        )}
      </div>

      <div className="action-buttons-container">
   {/* =================== EDIT PANEL =================== */}
<div className="action-panel-wrapper">
  <button
    className="edit-btn"
    onClick={() => {
      setEditData({
        prenom: salarie.prenom,
        nom: salarie.nom,
        email: salarie.email,
        gsm:salarie.gsm,
        adresse: salarie.adresse,
        linkedin: salarie.linkedin,
        github: salarie.github,
        sexe: salarie.sexe,
        // RH fields
        cin: salarie.cin,
        date_embauche: salarie.date_embauche,
        status: salarie.status,
        societe_id: salarie.societe_id,
        service_id: salarie.service_id,
        profession: salarie.profession,
        date_naissance: salarie.date_naissance,
        etat: salarie.date_naissance,
        salaire: salarie.salaire,
        situation_familiale: salarie.situation_familiale,
        nbre_enfants: salarie.nbre_enfants,
        banque: salarie.banque,
        adresse_agance: salarie.adresse_agance,
        rib: salarie.rib,
        cnss: salarie.cnss,

      });
      setOriginalEmail(salarie.email);
      setShowEditPanel(!showEditPanel);
    }}
  >
    {showEditPanel ? "Fermer" : "Modifier"}
  </button>

  {showEditPanel && (
  <>
    <div className="profile-edit-panel">
      <h3>Modifier le Profil</h3>
      <div className="edit-form">
        {/* ===== DYNAMIC COLUMNS LAYOUT ===== */}
        <div className="edit-columns-container">
          {/* COLUMN 1 - Basic Info */}
          <div className="edit-column">
            <div className="edit-input-group">
              <label>Prénom</label>
              <input
                value={editData.prenom || ""}
                onChange={(e) => handleChange("prenom", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>Nom</label>
              <input
                value={editData.nom || ""}
                onChange={(e) => handleChange("nom", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>Email</label>
              <input
                type="email"
                value={editData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>Téléphone</label>
              <input
                value={editData.gsm ||""}
                onChange={(e) => handleChange("gsm", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>Adresse</label>
              <input
                value={editData.adresse || ""}
                onChange={(e) => handleChange("adresse", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
                <label>Status</label>
                <select
                  value={editData.status || ""}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="status-select"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Actif">Actif</option>
                  <option value="En congé">En congé</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Démissionné">Démissionné</option>
                  <option value="Archivé">Archivé</option>
                  <option value="Licencié">Licencié</option>
                </select>
              </div>

              <div className="edit-input-group">
                <label>CIN</label>
                  <input
                    value={editData.cin || ""}
                    onChange={(e) => handleChange("cin", e.target.value)}
                  />
              </div>

          </div>

          {/* COLUMN 2 - Social & Files */}
          <div className="edit-column">
            <div className="edit-input-group">

              <label>Sexe</label>
              <select
                value={editData.sexe || ""}
                onChange={e => handleChange("sexe", e.target.value)}
              >
                <option value="">-- Sélectionner --</option>
                <option value="Monsieur">Homme</option>
                <option value="Madame">Femme</option>
              </select>

              <label>LinkedIn</label>
              <input
                placeholder="https://linkedin.com/in/..."
                value={editData.linkedin || ""}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>GitHub</label>
              <input
                placeholder="https://github.com/..."
                value={editData.github || ""}
                onChange={(e) => handleChange("github", e.target.value)}
              />
            </div>

            <div className="edit-input-group">
              <label>Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleChange("photo", e.target.files[0])}
              />
            </div>

            <div className="edit-input-group">
              <label>CV</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleChange("cv", e.target.files[0])}
              />
            </div>

            {/* ===== RH BASIC FIELDS ===== */}
            {isRH && (
              <>

                <div className="edit-input-group">
                  <label>Date d'embauche</label>
                  <input
                    type="date"
                    value={editData.date_embauche || ""}
                    onChange={(e) =>
                      handleChange("date_embauche", e.target.value)
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* COLUMN 3 - RH Only Fields (Organization) */}
          {isRH && (
            <div className="edit-column">
              <div className="edit-input-group">
                <label>Status</label>
                <select
                  value={editData.status || ""}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="status-select"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Actif">Actif</option>
                  <option value="En congé">En congé</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Démissionné">Démissionné</option>
                  <option value="Archivé">Archivé</option>
                  <option value="Licencié">Licencié</option>
                </select>
              </div>

              <div className="edit-input-group">
                <label>CIN</label>
                  <input
                    value={editData.cin || ""}
                    onChange={(e) => handleChange("cin", e.target.value)}
                  />
              </div>

              <div className="edit-input-group">
                <label>Société</label>
                <select
                  value={editData.societe_id || ""}
                  onChange={(e) => {
                    handleChange("societe_id", e.target.value);
                    handleChange("service_id", "");
                  }}
                >
                  <option value="">Choisir une société</option>
                  {societes.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-input-group">
                <label>Service</label>
                <select
                  value={editData.service_id || ""}
                  onChange={(e) => handleChange("service_id", e.target.value)}
                  disabled={!editData.societe_id}
                  className={!editData.societe_id ? "disabled-select" : ""}
                >
                  <option value="">-- Choisir un service --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nom}
                    </option>
                  ))}
                </select>
                {!editData.societe_id && (
                  <small className="select-hint">Sélectionnez d'abord une société</small>
                )}
              </div>

              <div className="edit-input-group">
                <label>Profession</label>
                <input
                  value={editData.profession || ""}
                  onChange={(e) => handleChange("profession", e.target.value)}
                />
              </div>
              
            <div className="edit-input-group">
              <label>Date de naissance</label>
                <input
                  value={editData.date_naissance || ""}
                  onChange={(e) => handleChange("date_naissance", e.target.value)}
                />
            </div>

            <div className="edit-input-group">
              <label>etat</label>
                <input
                  value={editData.etat || ""}
                  onChange={(e) => handleChange("etat", e.target.value)}
                />
            </div>
            <div className="edit-input-group">
              <label>Salaire</label>
                <input
                  value={editData.salaire || ""}
                  onChange={(e) => handleChange("salaire", e.target.value)}
                />
            </div>

             <div className="edit-input-group">
                <label>Situation familiale</label>
                <select
                  value={editData.status || ""}
                  onChange={(e) => handleChange("situation_familiale", e.target.value)}
                  className="status-select"
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                </select>
              </div>

            <div className="edit-input-group">
              <label>Nombre d'enfants</label>
                <input
                  value={editData.nbre_enfants || ""}
                  onChange={(e) => handleChange("nbre_enfants", e.target.value)}
                />
            </div>
            <div className="edit-input-group">
              <label>Banque</label>
                <input
                  value={editData.banque || ""}
                  onChange={(e) => handleChange("banque", e.target.value)}
                />
            </div>
            <div className="edit-input-group">
              <label>Adresse d'agence</label>
                <input
                  value={editData.adresse_agance || ""}
                  onChange={(e) => handleChange("adresse_agance", e.target.value)}
                />
            </div>
            <div className="edit-input-group">
              <label>RIB</label>
                <input
                  value={editData.rib || ""}
                  onChange={(e) => handleChange("rib", e.target.value)}
                />
            </div>

            <div className="edit-input-group">
              <label>CNSS</label>
                <input
                  value={editData.cnss || ""}
                  onChange={(e) => handleChange("cnss", e.target.value)}
                />
            </div>
            
          </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="edit-actions">
        <button type="button" onClick={handleSave}>Valider</button>
        <button type="button" onClick={() => setShowEditPanel(false)}>Annuler</button>
      </div>
    </div>
  </>
)}
</div>

  {/* =================== DELETE PANEL =================== */}
<div className="action-panel-wrapper">
  <button className="delete-btn" onClick={() => setShowDeletePanel(!showDeletePanel)}>
    {showDeletePanel ? "Fermer" : "Supprimer"}
  </button>

  {showDeletePanel && (
    <div className="delete-panel-overlay">
      <div className="delete-panel-content">
        <h3>Supprimer des éléments</h3>
        <div className="delete-options-grid">
          {salarie.cv && (
            <button className="delete-option-btn" onClick={() => handleDelete("cv")}>
              Supprimer le CV
            </button>
          )}
          {salarie.photo && (
            <button className="delete-option-btn" onClick={() => handleDelete("photo")}>
              Supprimer la photo
            </button>
          )}
          {salarie.linkedin && (
            <button className="delete-option-btn" onClick={() => handleDelete("linkedin")}>
              Supprimer LinkedIn
            </button>
          )}
          {salarie.github && (
            <button className="delete-option-btn" onClick={() => handleDelete("github")}>
              Supprimer GitHub
            </button>
          )}
        </div>
        
        {/* Action button INSIDE the panel content */}
        <div className="delete-panel-actions">
          <button type="button" onClick={() => setShowDeletePanel(false)}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  )}
</div>


      </div>
    </div>
  );
}
