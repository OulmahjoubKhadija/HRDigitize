import { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import { getDocumentTemplates } from "../../../services/documentTemplate.service";
const DocumentTemplateTable = ({ data, onEdit, onDelete }) => {

const [templates, setTemplates] = useState([]);

  useEffect(() => {
    getDocumentTemplates().then((res) => {
      setTemplates(res.data.data || []);
    });
  }, []);

  return (
    <table border="1" cellPadding="10" width="100%">
      <thead>
        <tr>
          <th>Type Document</th>
          <th>Roles Autorisés</th>
          <th>Variables</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((item) => (
            <tr key={item.id}>
              <td>{item.type_document?.nom || "N/A"}</td>
              <td>{(item.roles_autorises || []).join(", ")}</td>
              <td>
                    {(() => {
                        let vars = item.variable_json;

                        if (typeof vars === "string") {
                        try {
                            vars = JSON.parse(vars);
                        } catch {
                            vars = [];
                        }
                        }

                        if (!Array.isArray(vars)) {
                        vars = Object.values(vars || {});
                        }

                        return vars.join(", ");
                    })()}
                </td>
              <td>
                <Button onClick={() => onEdit(item)}>Modifier</Button>
                <Button onClick={() => onDelete(item)} variant="danger">
                  Annuler
                </Button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} style={{ textAlign: "center" }}>
              Aucun modèle trouvé
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default DocumentTemplateTable;