import api from "../api/axios";

// Get paginated templates
export const getDocumentTemplates = (page = 1) => {
  return api.get(`/document-templates?page=${page}`);
};

// Create template with FormData (file upload)
export const createDocumentTemplate = (formData) => {
  return api.post("/document-templates", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
.then(res => console.log(res.data))
.catch(err => {
  console.error("CREATE TEMPLATE ERROR:", err.response?.data);
})
};

// Update template with FormData (file upload optional)
export const updateDocumentTemplate = (id, formData) => {
  
  if (!formData.get("roles_autorises")) formData.append("roles_autorises", JSON.stringify([]));
  if (!formData.get("variable_json")) formData.append("variable_json", JSON.stringify([]));

  return api.put(`/document-templates/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete template
export const deleteDocumentTemplate = (id) => {
  return api.delete(`/document-templates/${id}`);
};