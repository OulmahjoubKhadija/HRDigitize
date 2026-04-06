import { useEffect, useState } from "react";
import api from "../../../api/axios";
import { useAuth } from "../../../context/AuthContext";

import EditSalarieModal from "../../../modals/EditSalarieModal";
import ViewSalarieModal from "../../../modals/ViewSalarieModal";
import SalarieDeleteConfirm from "../../../modals/SalarieDeleteConfirm";


import profile from "../../../assets/profile.webp";
export default function SalarieTab() {
  const { user } = useAuth();
  const isRH = user?.role === "RH";

  const [salaries, setSalaries] = useState([]);
  const [selectedSalarie, setSelectedSalarie] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const backendURL = "http://localhost:8000";
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const styles = {
    photo: {
      maxWidth: "100px",
      maxHeight: "200px",
      borderRadius: "25px",
    }
  }

  const fetchSalaries = async (searchQuery = "", pageNumber = 1) => {
    try {
      const res = await api.get("/salaries", {
        params: { search: searchQuery, per_page: perPage, page: pageNumber },
      });

      setSalaries(res.data.data);
      setTotalPages(res.data.meta.last_page);
      setPage(res.data.meta.current_page);
    } catch (err) {
      console.error(err);
    }
  };


  useEffect(() => {
    fetchSalaries(search, page);
  }, [search, page]);

  const openModal = (type, salarie) => {
    setSelectedSalarie(salarie);
    setActiveModal(type);
  };

  const closeModal = () => {
    setSelectedSalarie(null);
    setActiveModal(null);
  };

  const updateSalarieInState = (updatedSalarie) => {
    setSalaries(prev => prev.map(s => s.id === updatedSalarie.id ? updatedSalarie : s));
  };

  const deleteSalarie = async (salarie) => {
    if (!salarie.user?.is_active) {
      alert("Ce salarié est déjà archivé !");
      return;
    }
    try {
      await api.delete(`/salaries/${salarie.id}`);
      setSalaries(prev => prev.filter(s => s.id !== salarie.id));
    } catch (err) {
      console.error("Erreur lors de la suppression :", err.response?.data || err);
      alert(err.response?.data?.message || "Erreur inconnue");
    }
  };


  return (
    <>
      {/* Search */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom, prénom, CIN, société ou service"
          className="input input-bordered w-full max-w-sm"
        />
      </div>

      {/* Salarie table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Photo</th>
            {isRH &&(<th className="p-2 border">CIN</th>)}
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Prénom</th>
            <th className="p-2 border">Rôle</th>
            <th className="p-2 border">Profession</th>
            <th className="p-2 border">Société</th>
            <th className="p-2 border">Service</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map(s => (
            <tr key={s.id}>
              <td className="p-2 border">
                <img src={ photoPreview ? photoPreview : s.photo ? backendURL + s.photo : profile}
                  onError={(e) => e.target.src = profile}
                  style={styles.photo} /></td>
              {isRH && (<td className="p-2 border">{s.cin}</td>)}
              <td className="p-2 border">{s.nom}</td>
              <td className="p-2 border">{s.prenom}</td>
              <td className="p-2 border">{s.role}</td>
              <td className="p-2 border">{s.profession ?? "-"}</td>
              <td className="p-2 border">{s.societe?.nom ?? "-"}</td>
              <td className="p-2 border">{s.service?.nom ?? "-"}</td>
              <td className="p-2 border space-x-2">
                {/* Everyone can view */}
                <button className="text-blue-600" onClick={() => openModal("view", s)}>Voir</button>


                {/* Only RH can edit or delete */}
                {isRH && (
                    <>
                    <button className="text-orange-600" onClick={() => openModal("edit", s)}>Modifier</button>
                    <button className="text-red-600" onClick={() => openModal("delete", s)} disabled={!s.user?.is_active || s.is_active_encadrant}> Supprimer </button>

                    </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        <button className="btn btn-outline" onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page <= 1}>Précédent</button>
        <span className="px-2 py-1 border rounded"> Page {page} / {totalPages}</span>
        <button className="btn btn-outline" onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page >= totalPages}>Suivant</button>
      </div>

      {/* Modals */}
      {activeModal === "view" && <ViewSalarieModal salarie={selectedSalarie} onClose={closeModal} />}
      {activeModal === "edit" && <EditSalarieModal salarie={selectedSalarie} onClose={closeModal} updateSalarieInState={updateSalarieInState} />}
      {activeModal === "delete" && selectedSalarie && ( <SalarieDeleteConfirm salarie={selectedSalarie} onClose={closeModal} onConfirm={deleteSalarie} /> )}

    </>
  );
}