import { useEffect, useState } from "react";
import { getDocumentTemplates,
  createDocumentTemplate,
  updateDocumentTemplate,
  deleteDocumentTemplate, 
} from "../../services/documentTemplate.service" 

import DocumentTemplateTable from "./tab/DocumentTemplateTable";
import CreateDocumentTemplateModal from "../../modals/CreateDocumentTemplateModal";
import EditDocumentTemplateModal from "../../modals/EditDocumentTemplateModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/common/Button";

const DocumentTemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getDocumentTemplates();
      setTemplates(response.data.data || []); 
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreate = async (formData) => {
    await createDocumentTemplate(formData);
    setShowCreate(false);
    fetchTemplates();
  };

  const handleUpdate = async (formData) => {
    await updateDocumentTemplate(selected.id, formData);
    setShowEdit(false);
    fetchTemplates();
  };

  const handleDelete = async () => {
    await deleteDocumentTemplate(selected.id);
    setShowDelete(false);
    fetchTemplates();
  };

  return (
    <div className="container">
      <h2>Modèles de documents</h2>

      <Button onClick={() => setShowCreate(true)}>+ Ajouter un modèle</Button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DocumentTemplateTable
          data={templates}
          onEdit={(item) => {
            setSelected(item);
            setShowEdit(true);
          }}
          onDelete={(item) => {
            setSelected(item);
            setShowDelete(true);
          }}
        />
      )}

      {showCreate && (
        <CreateDocumentTemplateModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {showEdit && (
        <EditDocumentTemplateModal
          data={selected}
          onClose={() => setShowEdit(false)}
          onSubmit={handleUpdate}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          message="Êtes-vous sûr de vouloir supprimer ce modèle ?"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default DocumentTemplatesPage;