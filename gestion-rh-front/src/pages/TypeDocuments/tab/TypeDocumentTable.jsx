import Button from "../../../components/common/Button";

const TypeDocumentTable = ({ data, onEdit, onDelete }) => {
  return (
    <table border="1" cellPadding="10" width="100%">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Cible</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id}>
              <td>{item.nom}</td>
              <td>{item.cible}</td>
              <td>{item.description ?? "-"}</td>
              <td>
                <Button onClick={() => onEdit(item)}>Modifier</Button>
                <Button onClick={() => onDelete(item)} variant="danger">
                  Supprimer
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" style={{ textAlign: "center" }}>
              Aucun type de document existe pour le moment
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default TypeDocumentTable;