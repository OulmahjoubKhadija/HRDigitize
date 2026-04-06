import "./ProfileForms.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function UserProfileForm() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    sexe: "",
    linkedin: "",
    github: "",
    cv: null,
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formData = new FormData();

      Object.keys(form).forEach((key) => {
        if (form[key]) {
          formData.append(key, form[key]);
        }
      });

      const response = await api.post("/complete-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(response.data.message);
      updateUser({ is_profile_completed: true });
      navigate("/profile", { replace: true });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else if (err.response?.status === 403) {
        alert(err.response.data.message);
        navigate("/");
      } else {
        alert("Une erreur est survenue");
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
          <br/> <em>Vous pouvez modifier ces informations plus tard.</em>
        </p>
      </div>

      <div className="profile-form-container">
        <h2 className="form-title">Informations Personnelles</h2>
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">

            {/* LinkedIn */}
            <div className="form-input-group">
              <label htmlFor="linkedin">LinkedIn</label>
              <input
                id="linkedin"
                name="linkedin"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedin}
                onChange={handleChange}
              />
            </div>

            {/* GitHub */}
            <div className="form-input-group">
              <label htmlFor="github">GitHub</label>
              <input
                id="github"
                name="github"
                placeholder="https://github.com/..."
                value={form.github}
                onChange={handleChange}
              />
            </div>

            {/* Sexe */}
            <div className="form-input-group">
              <label htmlFor="sexe" className="required-field">Sexe</label>
              <select 
                id="sexe" 
                name="sexe" 
                value={form.sexe} 
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

          {/* File Uploads */}
          <div className="form-files-section">
            <h3>Documents</h3>
            <div className="form-files-grid">
              {/* CV */}
              <div className="form-file-item">
                <div className="form-file-label">CV (PDF)</div>
                <div className="form-file-input-container">
                  <input
                    type="file"
                    name="cv"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {errors.cv && <span className="form-error">{errors.cv}</span>}

              {/* Photo */}
              <div className="form-file-item">
                <div className="form-file-label">Photo</div>
                <div className="form-file-input-container">
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {errors.photo && <span className="form-error">{errors.photo}</span>}
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
                Chargement...
              </>
            ) : "Valider et continuer"}
          </button>
        </form>
      </div>
    </div>
  );
}