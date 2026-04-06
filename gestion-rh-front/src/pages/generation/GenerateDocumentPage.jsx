import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const DOCUMENT_VARIABLES = {
  mission: [
    "mission_date",
    "mission_duree",
    "mission_lieu",
    "mission_jours",
    "mission_motif",
    "depart",
    "arrivee",
    "moyen_transport",
    "date_heure_deplacement",
    "frais_transport",
    "frais_hebergement",
    "frais_restauration",
    "autres_frais",
    "mode_paiement"
  ],
  materiel: [
    "marque",
    "serie"
  ],
  conge: [
    "remplacant",
    "date_debut_conge",
    "date_fin_conge",
    "nombre_jours",
    "motif_conge"
  ]
};

const LABELS = {
  mission_date: "Date de mission",
  mission_duree: "Durée",
  mission_lieu: "Lieu",
  mission_jours: "Nombre de jours",
  mission_motif: "Motif",
  depart: "Départ",
  arrivee: "Arrivée",
  moyen_transport: "Moyen de transport",
  date_heure_deplacement: "Date & heure",
  frais_transport: "Frais transport",
  frais_hebergement: "Frais hébergement",
  frais_restauration: "Frais restauration",
  autres_frais: "Autres frais",
  mode_paiement: "Mode de paiement",

  marque: "Marque",
  serie: "Série",

  remplacant: "Remplaçant",
  date_debut_conge: "Date début",
  date_fin_conge: "Date fin",
  nombre_jours: "Nombre de jours",
  motif_conge: "Motif"
};

export default function GenerateDocumentPage() {

  const { user } = useAuth();
  const isRH = user?.role === "RH";

  const [users, setUsers] = useState([]);
  const [types, setTypes] = useState([]);

  const [userId, setUserId] = useState("");
  const [typeId, setTypeId] = useState("");

  const [variables, setVariables] = useState({});
  const [currentVariables, setCurrentVariables] = useState([]);

  const [loading, setLoading] = useState(false);

  // ----------------------
  // Fetch Data
  // ----------------------

  const fetchUsers = async () => {
    if (!isRH) return;

    try {
      const res = await api.get("/salaries");
      setUsers(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
  try {
    const res = await api.get("/document-templates");

    const data = res.data.data || res.data;

    let filtered = [];

    if (isRH) {
      // RH → only templates that include RH
      filtered = data.filter(t =>
        t.roles_autorises?.includes("RH")
      );
    } else {
      // NON RH → exclude RH-only templates
      filtered = data.filter(t =>
        t.roles_autorises?.includes(user.role)
      );
    }

    setTypes(filtered);

  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    fetchTemplates();
    fetchUsers();
  }, []);

  // ----------------------
  // Handlers
  // ----------------------

  const handleVariableChange = (key, value) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTypeChange = (selectedId) => {

  setTypeId(selectedId);
  setVariables({});
  setCurrentVariables([]);

  const selectedTemplate = types.find(
    t => t.type_document_id == selectedId
  );

  if (!selectedTemplate) return;

  let category = selectedTemplate.type_document?.categorie;

    
    if (!category) {
    const nom = selectedTemplate.type_document?.nom?.toLowerCase();

    if (nom.includes("mission") || nom.includes("déplacement")) {
        category = "mission";
    } else if (nom.includes("congé")) {
        category = "conge";
    } else if (nom.includes("matériel")) {
        category = "materiel";
    }
    }

  setCurrentVariables(DOCUMENT_VARIABLES[category] || []);
};

  const handleGenerate = async () => {

    if (!typeId) {
      alert("Choisir un type de document");
      return;
    }

    try {

      setLoading(true);

      await api.post("/demandes", {

        type_document_id: typeId,
        variables: variables,

        ...(userId && { target_user_id: userId })

      });

      alert("Document généré avec succès");

      setVariables({});
      setTypeId("");
      setUserId("");
      setCurrentVariables([]);

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Erreur lors de la génération"
      );

    } finally {

      setLoading(false);

    }
  };

  // ----------------------
  // UI
  // ----------------------

  return (
    <div>

      <h2>Générer un document</h2>

      {/* RH ONLY */}
      {isRH && (
        <div>
          <label>Utilisateur</label>

          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            <option value="">-- Moi-même --</option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom} {u.prenom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* TYPE */}
      <div>
        <label>Type de document</label>

        <select
          value={typeId}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          <option value="">-- Choisir --</option>

          {types.map((t) => (
            <option key={t.id} value={t.type_document_id}>
                {t.type_document?.nom}
            </option>
          ))}
        </select>
      </div>

      {/* VARIABLES */}
      <h3>Variables</h3>

      {currentVariables.length === 0 && (
        <p>Aucune variable requise</p>
      )}

      {currentVariables.map((v) => (
        <div key={v} style={{ marginBottom: "10px" }}>

          <label>{LABELS[v] || v}</label>

          <input
            type="text"
            value={variables[v] || ""}
            onChange={(e) =>
              handleVariableChange(v, e.target.value)
            }
          />

        </div>
      ))}

      <br />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Génération..." : "Générer"}
      </button>

    </div>
  );
}