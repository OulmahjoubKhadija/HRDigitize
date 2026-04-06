import { useEffect, useState } from "react";
import DemandeTable from "./tabs/DemandeTable";
import {
  getDemandes,
  downloadDocument,
} from "../../services/demande.service";

import ValidateDemandeModal from "../../modals/ValidateDemandeModal";
import EditDemandeModal from "../../modals/EditDemandeModal";

export default function MesDemandesPage({ user }) {
  const [demandes, setDemandes] = useState([]);
  const [modal, setModal] = useState({ type: null, data: null });

  const fetchDemandes = async () => {
    const res = await getDemandes();
    setDemandes(res.data);
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  return (
    <div>
      <h2>Mes demandes</h2>

      <DemandeTable
        demandes={demandes}
        user={user}
        isRH={false}
        onDownload={downloadDocument}
        onEdit={(d) => setModal({ type: "edit", data: d })}
      />

      {modal.type === "edit" && (
        <EditDemandeModal
          demande={modal.data}
          onClose={() => setModal({ type: null })}
          onSuccess={fetchDemandes}
        />
      )}
    </div>
  );
}