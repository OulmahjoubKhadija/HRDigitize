import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function GenerateForUserPage() {

  const [users, setUsers] = useState([]);
  const [stagiaires, setStagiaires] = useState([]);
  const [types, setTypes] = useState([]);

  const [userId, setUserId] = useState("");
  const [typeId, setTypeId] = useState("");

  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentVariables, setCurrentVariables] = useState([]);

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

  const fetchSalaries = async () => {

    try {

      const res = await api.get("/salaries");

      setUsers(res.data.data || res.data);

    } catch (err) {

      console.error(err);

    }
  };

    const fetchStagiaires = async () => {

    try {

      const res = await api.get("/stagiaires");

      setStagiaires(res.data.data || res.data);

    } catch (err) {

      console.error(err);

    }
  };

  const fetchTypes = async () => {

    try {

      const res = await api.get("/type-documents");

      setTypes(res.data.data || res.data);

    } catch (err) {

      console.error(err);

    }
  };

  useEffect(() => {

    fetchSalaries();
    fetchStagiaires();
    fetchTypes();

  }, []);


  const handleVariableChange = (key, value) => {

    setVariables((prev) => ({
      ...prev,
      [key]: value
    }));

  };


  const handleGenerate = async () => {

    if (!userId || !typeId) {
      alert("Sélectionner utilisateur et document");
      return;
    }

    try {

      setLoading(true);

      await api.post("/demandes", {

        target_user_id: userId,
        type_document_id: typeId,
        variables: variables

      });

      alert("Document généré pour l'utilisateur");

      setVariables({});
      setTypeId("");
      setUserId("");

    } catch (err) {

      console.error(err);

      alert(
        err.response?.data?.message ||
        "Erreur génération"
      );

    } finally {

      setLoading(false);

    }
  };


  return (

    <div>

      <h2>Générer un document pour un utilisateur</h2>


      <div>

        <label>Salaries: </label>

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >

          <option value="">-- Choisir --</option>

          {users.map((u) => (

            <option key={u.id} value={u.id}>
              {u.nom && u.prenom}
            </option>

          ))}

        </select>

      </div>

      <div>

        <label>Stagiaires: </label>

        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        >

          <option value="">-- Choisir --</option>

          {users.map((u) => (

            <option key={u.id} value={u.id}>
              {u.nom && u.prenom}
            </option>

          ))}

        </select>

      </div>

      <div>

        <label>Type de document</label>

        <select
            value={typeId}
            onChange={(e) => {

                const selectedId = e.target.value;

                setTypeId(selectedId);

                const selectedType = types.find(t => t.id == selectedId);

                if (!selectedType) return;

                const category = selectedType.categorie;

                setCurrentVariables(DOCUMENT_VARIABLES[category] || []);

            }}
        >

          <option value="">-- Choisir --</option>

          {types.map((t) => (

            <option key={t.id} value={t.id}>
              {t.nom}
            </option>

          ))}

        </select>

      </div>

      <h3>Variables</h3>

    {currentVariables.map((v) => (

    <div key={v} style={{marginBottom:"8px"}}>

        <label>{v}</label>

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