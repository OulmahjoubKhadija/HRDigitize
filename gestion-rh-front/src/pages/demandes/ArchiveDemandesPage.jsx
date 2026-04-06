import { useEffect, useState } from "react";
import DemandeTable from "./tabs/DemandeTable";
import { getDemandes } from "../../services/demande.service";

export default function ArchiveDemandesPage({ user }) {
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    const res = await getDemandes();

    const archived = res.data.filter(
      (d) => d.status === "approuvee" || d.status === "refusee"
    );

    setDemandes(archived);
  };

  return (
    <div>
      <h2>Archive des demandes</h2>

      <DemandeTable
        demandes={demandes}
        user={user}
        isRH={user.role === "RH"}
      />
    </div>
  );
}