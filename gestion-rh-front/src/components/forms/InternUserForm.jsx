import "./ProfileForms.css";
import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function InternUserForm() {
  const [formData, setFormData] = useState({
    sexe: "",
    telephone: "",
    filiere: "",
    cv: null,
    demande_stage: null,
    fiche_reussite: null,
    accord_stage: null,
    entreprise_accueil: null,
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const { updateUser } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        data.append(key, value);
      }
    });

    try {
      await api.post("/stagiaire/complete-profile", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update user in AuthContext to mark profile as completed
      updateUser({ is_profile_completed: true });

      setSuccess("Profil complété avec succès !");

      // Navigate to the stagiaire profile page after a short delay
      setTimeout(() => {
        navigate("/stagiaire/profile");
      }, 500);
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ global: "Erreur serveur. Veuillez réessayer." });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="profile-form-page">
      <div className="form-info-box">
        <strong>Complétez votre profil</strong>
        <p>
          Pour accéder à toutes les fonctionnalités de la plateforme, veuillez compléter votre profil.
          <br /> <em>Vous pouvez modifier ces informations plus tard.</em>
        </p>
      </div>

      <div className="profile-form-container">
        <h2 className="form-title">Profil Stagiaire</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Global Messages */}
          {errors.global && (
            <div className="form-global-error">{errors.global}</div>
          )}
          {success && (
            <div className="form-success">{success}</div>
          )}

          {/* Personal Information */}
          <div className="form-grid three-columns">

            {/* Téléphone */}
            <div className="form-input-group">
              <label htmlFor="telephone" className="required-field">Téléphone</label>
              <input
                id="telephone"
                name="telephone"
                placeholder="Numéro de téléphone"
                onChange={handleChange}
                required
              />
              {errors.telephone && <span className="form-error">{errors.telephone}</span>}
            </div>

            {/* Filière */}
            <div className="form-input-group">
              <label htmlFor="filiere" className="required-field">Filière</label>
              <input
                id="filiere"
                name="filiere"
                placeholder="Votre filière d'étude"
                onChange={handleChange}
                required
              />
              {errors.filiere && <span className="form-error">{errors.filiere}</span>}
            </div>

            {/* Sexe */}
            <div className="form-input-group">
              <label htmlFor="sexe" className="required-field">Sexe</label>
              <select
                id="sexe"
                name="sexe"
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                <option value="Monsieur">Homme</option>
                <option value="Madame">Femme</option>
              </select>
              {errors.sexe && <span className="form-error">{errors.sexe}</span>}
            </div>

          </div>

          {/* File Uploads - Intern Specific */}
          <div className="form-files-section">
            <h3>Documents de Stage</h3>
            <div className="form-files-grid">
              {[
                { name: "cv", label: "CV", accept: ".pdf,.doc,.docx", required: true },
                { name: "demande_stage", label: "Demande de stage", accept: ".pdf,.doc,.docx", required: false },
                { name: "fiche_reussite", label: "Fiche de réussite", accept: ".pdf,.doc,.docx", required: false },
                { name: "accord_stage", label: "Accord de stage", accept: ".pdf,.doc,.docx", required: false },
                { name: "entreprise_accueil", label: "Entreprise d'accueil", accept: ".pdf,.doc,.docx", required: false },
                { name: "photo", label: "Photo", accept: "image/*", required: false },
              ].map((file) => (
                <div key={file.name} className="form-file-item">
                  <div className="form-file-label">
                    {file.label}
                    <span className="required-indicator">*</span>
                  </div>
                  <div className="form-file-input-container">
                    <input
                      type="file"
                      name={file.name}
                      accept={file.accept}
                      onChange={handleFileChange}
                      required={file.required}
                    />
                  </div>
                  {errors[file.name] && <span className="form-error">{errors[file.name]}</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="form-submit-btn"
          >
            {loading ? (
              <>
                <span className="form-loading"></span>
                Envoi en cours...
              </>
            ) : "Compléter le profil"}
          </button>
        </form>
      </div>
    </div>
  );
}