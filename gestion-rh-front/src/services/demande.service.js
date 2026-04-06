import api from "../api/axios";

export const getDemandes = () => {
  return api
.get("/demandes");
};

export const updateDemande = (id, data) => {
  return api
.patch(`/demandes/${id}`, data);
};

export const downloadDocument = async (id) => {
  const res = await api
.get(`/demandes/${id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", `document_${id}.docx`);
  document.body.appendChild(link);
  link.click();
};