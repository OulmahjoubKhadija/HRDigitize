import api from "../api/axios";

export const getTypeDocuments = () => {
  return api.get("/type-documents");
};

export const createTypeDocument = (data) => {
  return api.post("/type-documents", data);
};

export const updateTypeDocument = (id, data) => {
  return api.put(`/type-documents/${id}`, data);
};

export const deleteTypeDocument = (id) => {
  return api.delete(`/type-documents/${id}`);
};