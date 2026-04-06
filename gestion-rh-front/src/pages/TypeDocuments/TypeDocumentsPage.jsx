import { useEffect, useState } from "react";
import {
  getTypeDocuments,
  createTypeDocument,
  updateTypeDocument,
  deleteTypeDocument,
} from "../../services/typeDocument.service";

import TypeDocumentTable from "./tab/TypeDocumentTable";
import CreateTypeDocumentModal from "../../modals/CreateTypeDocumentModal";
import EditTypeDocumentModal from "../../modals/EditTypeDocumentModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Button from "../../components/common/Button";

const TypeDocumentsPage = () => {
  const [typeDocuments, setTypeDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState(null);

  const fetchTypeDocuments = async () => {
    try {
      setLoading(true);
      const response = await getTypeDocuments();
      setTypeDocuments(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypeDocuments();
  }, []);

  const handleCreate = async (data) => {
    await createTypeDocument(data);
    setShowCreate(false);
    fetchTypeDocuments();
  };

  const handleUpdate = async (data) => {
    await updateTypeDocument(selected.id, data);
    setShowEdit(false);
    fetchTypeDocuments();
  };

  const handleDelete = async () => {
    await deleteTypeDocument(selected.id);
    setShowDelete(false);
    fetchTypeDocuments();
  };


  return (
    <div className="container">
      <h2>Type Documents</h2>

      <Button onClick={() => setShowCreate(true)}>+ Add Type</Button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <TypeDocumentTable
          data={Array.isArray(typeDocuments) ? typeDocuments : []}
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
        <CreateTypeDocumentModal
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}

      {showEdit && (
        <EditTypeDocumentModal
          data={selected}
          onClose={() => setShowEdit(false)}
          onSubmit={handleUpdate}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          message="Êtes-vous sûr de vouloir supprimer ce type de document ?"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default TypeDocumentsPage;