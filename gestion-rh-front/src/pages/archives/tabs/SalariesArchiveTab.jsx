import { useEffect, useState } from "react";
import api from "../../../api/axios";
import profile from "../../../assets/profile.webp";

export default function SalariesArchiveTab() {
  const [salaries, setSalaries] = useState([]);
  const backendURL = "http://localhost:8000";

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 1;

  const styles = {
    photo: { maxWidth: "100px", maxHeight: "200px", borderRadius: "25px" },
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch archives from backend
  const fetchArchives = async (page = 1) => {
    try {
      const res = await api.get("/salaries/archives", {
        params: {
          page,
          per_page: perPage,
        },
      });
      setSalaries(res.data.data || []);
      setCurrentPage(res.data.meta.current_page);
      setLastPage(res.data.meta.last_page);
    } catch (err) {
      console.error("Erreur lors du fetch archives :", err);
    }
  };

  useEffect(() => {
    fetchArchives(currentPage);
  }, [currentPage]);

  // Restore salarié
  const restore = async (id) => {
    try {
      const res = await api.patch(`/salaries/${id}/restore`);
      // Remove restored salarié immediately
      setSalaries(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Erreur lors de la restauration");
    }
  };

  // Force delete salarié
  const forceDelete = async (id) => {
    if (!confirm("⚠️ Suppression définitive. Aucune restauration possible.")) return;
    if (!confirm("Dernier avertissement. Continuer ?")) return;

    try {
      await api.delete(`/salaries/${id}/force`);
      setSalaries(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression définitive");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/salaries/${id}/status`, { status });

      setSalaries(prev =>
        prev.map(s =>
          s.id === id ? { ...s, status } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut");
    }
  };


  if (salaries.length === 0) {
    return (
      <h1 className="text-center text-gray-500 text-lg mt-10">
        Aucun salarié archivé pour le moment
      </h1>
    );
  }

  return (
    <>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Photo</th>
            <th className="p-2 border">CIN</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Prénom</th>
            <th className="p-2 border">Téléphone</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Société</th>
            <th className="p-2 border">Service</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Archivé le</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id}>
              <td className="p-2 border">
                <img
                  src={s.photo ? backendURL + s.photo : profile}
                  onError={(e) => (e.target.src = profile)}
                  style={styles.photo}
                />
              </td>
              <td className="p-2 border">{s.cin}</td>
              <td className="p-2 border">{s.nom}</td>
              <td className="p-2 border">{s.prenom}</td>
              <td className="p-2 border">{s.gsm}</td>
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border">{s.societe?.nom ?? "-"}</td>
              <td className="p-2 border">{s.service?.nom ?? "-"}</td>
              <td className="border p-2">
                <select
                  value={s.status}
                  onChange={(e) => updateStatus(s.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="Archivé">Archivé</option>
                  <option value="Suspendu">Suspendu</option>
                  <option value="Démissionné">Démissionné</option>
                  <option value="Licencié">Licencié</option>
                </select>
              </td>

              <td className="border p-2 text-center text-sm text-gray-600 italic">
                {formatDate(s.archived_at)}
              </td>
              <td className="p-2 border space-x-3">
                <button className="text-green-600" onClick={() => restore(s.id)}>
                  Restaurer
                </button>
                <button className="text-red-600" onClick={() => forceDelete(s.id)}>
                  Supprimer définitivement
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pgination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          className="btn btn-sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Précédent
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} / {lastPage}
        </span>

        <button
          className="btn btn-sm"
          disabled={currentPage === lastPage}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Suivant
        </button>
      </div>
    </>
  );
}
