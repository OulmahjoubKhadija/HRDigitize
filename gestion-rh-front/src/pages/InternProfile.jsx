import { useEffect, useState } from "react";
import api from "../api/axios";
import "./MyProfile.css"; 
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaFileAlt,
  FaCamera,
  FaUserGraduate
} from "react-icons/fa";
import profileImg from "../assets/profile.webp";

export default function InternProfile() {
  const [stagiaire, setStagiaire] = useState(null);
  const [editData, setEditData] = useState({});
  const [showDeletePanel, setShowDeletePanel] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [services, setServices] = useState([]);

  const [originalEmail, setOriginalEmail] = useState("");

  const backendURL = "http://localhost:8000";

  /* ================= FETCH PROFILE ================= */
    useEffect(() => {
    // fetch stagiaire profile
    const fetchProfile = async () => {
        try {
        const res = await api.get("/me/stagiaire");
        setStagiaire(res.data.data);
        } catch (err) {
        console.error(err);
        alert("Impossible de récupérer le profil stagiaire");
        }
    };

    fetchProfile();
    }, []); // run once on mount

    useEffect(() => {
    // fetch services 
    if (!stagiaire?.societe_id) {
        setServices([]);
        return;
    }

    api
        .get(`/service/societe/${stagiaire.societe_id}`)
        .then(res => setServices(res.data || []))
        .catch(err => console.error("Erreur fetching services:", err));
    }, [stagiaire?.societe_id]);


  if (!stagiaire) {
    return <div className="profile-loading">Chargement...</div>;
  }

  /* ================= HANDLERS ================= */
  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.keys(editData).forEach(key => {
        if (editData[key]) {
          formData.append(key, editData[key]);
        }
      });

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

      formData.append("_method", "PUT");

      const res = await api.post("/me/stagiaire", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });


      setStagiaire(res.data.data);
      setShowEditPanel(false);
      setPhotoPreview(null);

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
      console.error(err.response?.data || err);
      alert("Erreur lors de la mise à jour");
    }
  };

  const handlePhotoUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("_method", "PUT");

    const res = await api.post("/me/stagiaire", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Update stagiaire with new photo path from backend
    setStagiaire(res.data.data);

    // Clear preview if you want to rely on saved photo
    setPhotoPreview(null);
  } catch (err) {
    console.error(err.response?.data || err);
    alert("Erreur lors de l'enregistrement de la photo");
  }
};

    const handleDelete = async (field) => {
  if (!window.confirm(`Voulez-vous vraiment supprimer ${field.replace('_', ' ')} ?`)) return;

  try {
    const res = await api.post("/me/stagiaire/delete", {
      [`delete_${field}`]: true,
    });

    setStagiaire(res.data.data);
    setShowDeletePanel(false);
    if (field === "photo") setPhotoPreview(null);
    setEditData(prev => ({ ...prev, [field]: null }));

  } catch (err) {
    console.error(err.response?.data || err);
    alert("Erreur lors de la suppression");
  }
};


  /* ================= RENDER ================= */
  return (
    <div className="profile-container">

      {/* ================= PROFILE CARD ================= */}
      <div className="profile-card">

        {/* Avatar */}
        <div className="avatar-wrapper">
          <img
            src={photoPreview || backendURL + stagiaire.photo || profileImg}
            className="profile-avatar"
            alt="Avatar"
            onClick={() => setShowPreview(true)}
            onError={(e) => (e.target.src = profileImg)}
            />


          <label className="camera-icon">
            <FaCamera />
            <input
            type="file"
            hidden
            accept="image/*"
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
        <h2 className="profile-name">
          {stagiaire.prenom} {stagiaire.nom}
        </h2>

        <div className="profile-details-container">

            {stagiaire.filiere && (
                <div className="profile-detail-item">
                <p>{stagiaire.filiere}</p>
                <label>Filière</label>
                </div>
            )}

            {stagiaire.societe && (
                <div className="profile-detail-item">
                <p>{stagiaire.societe.nom}</p>
                <label>Société</label>
                </div>
            )}

            {stagiaire.service && (
                <div className="profile-detail-item">
                 <p>{stagiaire.service.nom}</p>
                <label>Service</label>
                </div>
            )}

            {stagiaire.encadrant && (
                <div className="profile-detail-item">
                <p>
                    {stagiaire.encadrant.prenom} {stagiaire.encadrant.nom}
                </p>
                <label>Encadrant</label>
                </div>
            )}

        </div>



        {/* Info */}
        <div className="profile-info">
          <div className="profile-info-item">
            <FaEnvelope className="icon" />
            <span>{stagiaire.email}</span>
          </div>

          {stagiaire.telephone && (
            <div className="profile-info-item">
              <FaPhone className="icon" />
              <span>{stagiaire.telephone}</span>
            </div>
          )}

          {stagiaire.adresse && (
            <div className="profile-info-item">
              <FaMapMarkerAlt className="icon" />
              <span>{stagiaire.adresse}</span>
            </div>
          )}

          {stagiaire.cin && (
            <div className="profile-info-item">
              <FaIdCard className="icon" />
              <span>{stagiaire.cin}</span>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="profile-info">
          {[
            "cv",
            "demande_stage",
            "fiche_reussite",
            "accord_stage",
            "entreprise_accueil",
          ].map(field =>
            stagiaire[field] && (
              <div key={field} className="profile-info-item">
                <FaFileAlt className="icon" />
                <a
                  href={backendURL + stagiaire[field]}
                  target="_blank"
                  rel="noreferrer"
                >
                  {field.replace("_", " ")}
                </a>
              </div>
            )
          )}
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="action-buttons-container">

        {/* EDIT */}
        <button
          className="edit-btn"
          onClick={() => {
            setEditData({
              nom: stagiaire.nom,
              prenom: stagiaire.prenom,
              sexe: stagiaire.sexe,
              telephone: stagiaire.telephone,
              adresse: stagiaire.adresse,
              filiere: stagiaire.filiere,
              email: stagiaire.email,
            });
            setOriginalEmail(stagiaire.email);
            setShowEditPanel(true);
          }}
        >
          Modifier
        </button>

        {/* ================= EDIT PANEL ================= */}
        {showEditPanel && (
          <div className="profile-edit-panel">
            <h3>Modifier le profil</h3>

            <div className="edit-form">
              <div className="edit-columns-container">

                <div className="edit-column">
                  <label>Nom</label>
                  <input
                    value={editData.nom || ""}
                    onChange={e => handleChange("nom", e.target.value)}
                  />

                  <label>Prénom</label>
                  <input
                    value={editData.prenom || ""}
                    onChange={e => handleChange("prenom", e.target.value)}
                  />

                  <label>Email</label>
                  <input
                    type="email"
                    value={editData.email || ""}
                    onChange={e => handleChange("email", e.target.value)}
                  /> 

                  <label>Sexe</label>
                  <select
                    value={editData.sexe || ""}
                    onChange={e => handleChange("sexe", e.target.value)}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Monsieur">Homme</option>
                    <option value="Madame">Femme</option>
                  </select>

                  <label>Téléphone</label>
                  <input
                    value={editData.telephone || ""}
                    onChange={e => handleChange("telephone", e.target.value)}
                  />

                  <label>Filière</label>
                  <input
                    value={editData.filiere || ""}
                    onChange={e => handleChange("filiere", e.target.value)}
                  />
                </div>

                <div className="edit-column">
                  <label>CV</label>
                  <input type="file" onChange={e => handleChange("cv", e.target.files[0])} />

                  <label>Demande de stage</label>
                  <input type="file" onChange={e => handleChange("demande_stage", e.target.files[0])} />

                  <label>Fiche de réussite</label>
                  <input type="file" onChange={e => handleChange("fiche_reussite", e.target.files[0])} />

                  <label>Accord de stage</label>
                  <input type="file" onChange={e => handleChange("accord_stage", e.target.files[0])} />

                  <label>Entreprise d’accueil</label>
                  <input type="file" onChange={e => handleChange("entreprise_accueil", e.target.files[0])} />
                </div>

              </div>
            </div>

            <div className="edit-actions">
              <button onClick={handleSave}>Valider</button>
              <button onClick={() => setShowEditPanel(false)}>Annuler</button>
            </div>
          </div>
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
        <h3>Supprimer des fichiers</h3>
        <div className="delete-options-grid">
          {stagiaire.cv && (
            <button className="delete-option-btn" onClick={() => handleDelete("cv")}>
              Supprimer le CV
            </button>
          )}
          {stagiaire.demande_stage && (
            <button className="delete-option-btn" onClick={() => handleDelete("demande_stage")}>
              Supprimer la demande de stage
            </button>
          )}
          {stagiaire.fiche_reussite && (
            <button className="delete-option-btn" onClick={() => handleDelete("fiche_reussite")}>
              Supprimer la fiche de réussite
            </button>
          )}
          {stagiaire.accord_stage && (
            <button className="delete-option-btn" onClick={() => handleDelete("accord_stage")}>
              Supprimer l'accord de stage
            </button>
          )}
          {stagiaire.entreprise_accueil && (
            <button className="delete-option-btn" onClick={() => handleDelete("entreprise_accueil")}>
              Supprimer le document entreprise d'accueil
            </button>
          )}
          {stagiaire.photo && (
            <button className="delete-option-btn" onClick={() => handleDelete("photo")}>
              Supprimer la photo
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
  );
}
