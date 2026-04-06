import profile from "../assets/profile.webp";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
export default function ViewSalarieModal({ salarie, onClose }) {
  if (!salarie) return null;

  const { user } = useAuth();

  const isRH = user?.role === "RH";
  const isOwner = user?.salarie_id === salarie?.id;

  const backendURL = "http://localhost:8000";

  const cvUrl = salarie.cv?.startsWith("http")
  ? salarie.cv
  : `${backendURL}${salarie.cv}`;


  const [photoPreview, setPhotoPreview] = useState(null);

  const styles = {
    photo: {
      maxWidth: "150px",
      maxHeight: "250px",
      borderRadius: "100px",
    }
  }

  return (
    <div className="modal">
      <div className="modal-box max-w-xl">
        <h2 className="text-xl font-bold mb-4">Détails du salarié</h2>

        <div className="flex items-center mb-4">
          <img
            src={ photoPreview ? photoPreview : salarie.photo 
              ? backendURL + salarie.photo : profile}
            onError={(e) => e.target.src = profile}
            style={styles.photo}
          />

          <div>
            {salarie.cin &&(<p><strong>CIN :</strong> {salarie.cin}</p>)}
            {salarie.cin &&(<p><strong>CNSS:</strong> {salarie.cnss}</p>)}
            <p><strong>Nom :</strong> {salarie.nom ?? "-"}</p>
            <p><strong>Prénom :</strong> {salarie.prenom ?? "-"}</p>
            <p><strong>Rôle :</strong> {salarie.role ?? "-"}</p>
            {salarie.profession  &&(<p><strong>Profession :</strong> {salarie.profession ?? "-"}</p>)}
            <p><strong>Société :</strong> {salarie.societe?.nom ?? "-"}</p>
            <p><strong>Service :</strong> {salarie.service?.nom ?? "-"}</p>
            {salarie.salaire && (<p><strong>Salaire :</strong>{salarie.salaire}</p>)}
          </div>
        </div>

        {/* Common info for all logged-in users */}
        <p><strong>Email :</strong> {salarie.email ?? "-"}</p>
        {salarie.gsm &&(<p><strong>Téléphone :</strong> {salarie.gsm}</p>)}
        {salarie.adresse &&(<p><strong>Adresse :</strong> {salarie.adresse}</p>)}
        {salarie.linkedin &&(<p><strong>LinkedIn :</strong> {salarie.linkedin}</p>)}
        {salarie.github && (<p><strong>GitHub :</strong> {salarie.github}</p>)}

        {(isRH || isOwner) && salarie.cv && (
        <p>
          <strong>CV :</strong>
          <a href={cvUrl} target="_blank" rel="noreferrer" download className="link link-primary" >
            Voir le CV
          </a>
        </p>
        )}

        {/* RH-only info */}
        {isRH && (
          <>
            <p><strong>Date embauche :</strong> {salarie.date_embauche ?? "-"}</p>
            <p><strong>Status :</strong> {salarie.status ?? "-"}</p>
            <p><strong>Etat(Type de contrat):</strong> {salarie.etat ?? "-"}</p>
            <p><strong>Banque :</strong> {salarie.banque ?? "-"}</p>
            <p><strong>Adresse d'agence :</strong> {salarie.adresse_agence ?? "-"}</p>
            <p><strong>RIB :</strong> {salarie.rib ?? "-"}</p>
            <p><strong>Situation_familiale :</strong> {salarie.situation_familiale ?? "-"}</p>
            {salarie.nbre_enfants && (<p><strong>Nombre d'enfants :</strong>{salarie.nbre_enfants}</p>)}
            
          </>
        )}

        <div className="text-right mt-4">
          <button className="btn btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
