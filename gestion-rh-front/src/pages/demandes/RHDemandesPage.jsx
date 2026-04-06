import { useEffect, useState } from "react";
import DemandeTable from "../../components/demandes/DemandeTable";
import { getDemandes , downloadDocument  } from "../../services/demande.service";
  

import ValidateDemandeModal from "../../components/modals/ValidateDemandeModal";

export default function RHDemandesPage({ user }) {
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
      <h2>Demandes RH</h2>

      <DemandeTable
        demandes={demandes}
        user={user}
        isRH={true}
        onDownload={downloadDocument}
        onValidate={(d) => setModal({ type: "validate", data: d })}
      />

      {modal.type === "validate" && (
        <ValidateDemandeModal
          demande={modal.data}
          onClose={() => setModal({ type: null })}
          onSuccess={fetchDemandes}
        />
      )}
    </div>
  );
}