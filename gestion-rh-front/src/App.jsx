import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Login from "./pages/Login";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import CreateEmployee from "./pages/CreateEmployee.jsx";
import ProfileCompletion from "./pages/ProfileCompletion.jsx";
import Home from "./pages/Home.jsx";
import ResendActivationCode from "./context/ResendActivationCode.jsx";
import Navbar from "./pages/Navbar.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import InternProfileCompletion from "./pages/InternProfileCompletion.jsx";
import InternProfile from "./pages/InternProfile.jsx";
import CreateIntern from "./pages/CreateIntern.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import CreateSociete from "./components/forms/CreateSociete.jsx";
import CreateService from "./components/forms/CreateService.jsx";
import Dashboard from "./pages/Dashboard/Dashboard";
import Archives from "./pages/archives/Archives.jsx";
import TypeDocumentsPage from "./pages/TypeDocuments/TypeDocumentsPage.jsx";
import DocumentTemplatesPage from "./pages/DocumentTemplates/DocumentTemplatesPage.jsx";
import DemandeTable from "./pages/demandes/tabs/DemandeTable.jsx";
import MesDemandesPage from "./pages/demandes/MesDemandesPage.jsx";
import GenerateDocumentPage from "./pages/generation/GenerateDocumentPage.jsx";
// import GenerateForUserPage from "./pages/generation/GenerateForUserPage.jsx";

function App() {
  return (
    <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/resend-code" element={<ResendActivationCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/rh/create-employee"
            element={
              <RoleGuard roles={["RH"]}>
                <CreateEmployee />
              </RoleGuard>
            }
          />

          <Route
            path="/rh/create-societe"
            element={
              <RoleGuard roles={["RH"]}>
                <CreateSociete />
              </RoleGuard>
            }
          />

          <Route
            path="/rh/create-service"
            element={
              <RoleGuard roles={["RH"]}>
                <CreateService />
              </RoleGuard>
            }
          />

          <Route
            path="/create-intern"
            element={
              <RoleGuard roles={["RH","SALARIE","CHEF_SERVICE"]}>
                <CreateIntern />
              </RoleGuard>
            }
          />

          <Route
            path="/complete-profile"
            element={
              <RoleGuard roles={["RH", "SALARIE", "CHEF_SERVICE"]}>
                <ProfileCompletion />
              </RoleGuard>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
                }
          />

          <Route
            path="/stagiaire/complete-profile"
            element={
              <RoleGuard roles={["STAGIAIRE"]}>
                <InternProfileCompletion />
              </RoleGuard>
            }
          />

          <Route
            path="/stagiaire/profile"
            element={
              <RoleGuard roles={["STAGIAIRE"]}>
                <InternProfile />
              </RoleGuard>
            }
          />

          <Route
            path="/dashboard"
            element={
              <RoleGuard roles={["RH", "SALARIE", "CHEF_SERVICE"]}>
                <Dashboard />
              </RoleGuard>
            }
          />

          <Route
            path="/archives"
            element={
              <RoleGuard roles={["RH"]}>
                <Archives />
              </RoleGuard>
            }
          />

          <Route
            path="/type-documents"
            element={
              <RoleGuard roles={["RH"]}>
                <TypeDocumentsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/document-templates"
            element={
              <RoleGuard roles={["RH"]}>
                <DocumentTemplatesPage />
              </RoleGuard>
            }
          />
          <Route
            path="/demandes"
            element={
              <RoleGuard roles={["RH"]}>
                <DemandeTable />
              </RoleGuard>
            }
            >
          </Route>

          <Route
            path="/mes-demandes"
            element={
              <RoleGuard roles={["RH", "SALARIE", "CHEF_SERVICE", "STAGIAIRE"]}>
                <MesDemandesPage />
              </RoleGuard>
            }
            >
          </Route>

          <Route
            path="/generate-document"
            element={
              <RoleGuard roles={["RH","SALARIE", "CHEF_SERVICE"]}>
                <GenerateDocumentPage />
              </RoleGuard>
            }
            >
          </Route>


        </Routes>

      </AuthProvider>
    );
}

export default App;
