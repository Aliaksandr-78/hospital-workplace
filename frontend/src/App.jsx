import PropTypes from "prop-types"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { UIProvider } from "./context/UIContext"
import Login from "./pages/auth/Login"
import Main from "./pages/auth/Main"
import Dashboard from "./pages/dashboard/Dashboard"
import Patients from "./pages/dashboard/Patients"
import Appointments from "./pages/dashboard/Appointments"
import MedicalRecords from "./pages/dashboard/MedicalRecords"
import Prescriptions from "./pages/dashboard/Prescriptions"
import ManageSchedules from "./pages/dashboard/ManageSchedules"
import MedicalDischarges from "./pages/dashboard/MedicalDischarges"
import MedicalCertificates from "./pages/dashboard/MedicalCertificates"
import ConsentForms from "./pages/dashboard/ConsentForms"
import Reports from "./pages/admin/Reports"
import ManageUsers from "./pages/admin/ManageUsers"
import ManageServices from "./pages/admin/ManageServices"
import ManageSpecialties from "./pages/admin/ManageSpecialties"
import ManageRoles from "./pages/admin/ManageRoles"
import ManageMedications from "./pages/admin/ManageMedications"
import ManageLabTests from "./pages/admin/ManageLabTests"
import ManageDocumentTemplates from "./pages/admin/ManageDocumentTemplates"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ManageEventTypes from "./pages/admin/ManageEventTypes"
import ManageDiagnosis from "./pages/admin/ManageDiagnosis"
import PatientMedicalRecord from "./pages/dashboard/PatientMedicalRecord"

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/login" element={<Login />} />

            {/* Приватные маршруты */}
            <Route
              path="/main"
              element={
                <PrivateRoute>
                  <Main />
                </PrivateRoute>
              }
            />
            <Route
              path="/admindashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients"
              element={
                <PrivateRoute>
                  <Patients />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient-medical-record/:recordId"
              element={
                <PrivateRoute>
                  <PatientMedicalRecord />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/medical-records"
              element={
                <PrivateRoute>
                  <MedicalRecords />
                </PrivateRoute>
              }
            />
            <Route
              path="/prescriptions"
              element={
                <PrivateRoute>
                  <Prescriptions />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-schedules"
              element={
                <PrivateRoute>
                  <ManageSchedules />
                </PrivateRoute>
              }
            />
            <Route
              path="/medical-discharges"
              element={
                <PrivateRoute>
                  <MedicalDischarges />
                </PrivateRoute>
              }
            />
            <Route
              path="/medical-certificates"
              element={
                <PrivateRoute>
                  <MedicalCertificates />
                </PrivateRoute>
              }
            />
            <Route
              path="/consent-forms"
              element={
                <PrivateRoute>
                  <ConsentForms />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <Reports />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <PrivateRoute>
                  <ManageUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-services"
              element={
                <PrivateRoute>
                  <ManageServices />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-specialties"
              element={
                <PrivateRoute>
                  <ManageSpecialties />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-roles"
              element={
                <PrivateRoute>
                  <ManageRoles />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-eventtypes"
              element={
                <PrivateRoute>
                  <ManageEventTypes />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-medications"
              element={
                <PrivateRoute>
                  <ManageMedications />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-diagnosis"
              element={
                <PrivateRoute>
                  <ManageDiagnosis />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-lab-tests"
              element={
                <PrivateRoute>
                  <ManageLabTests />
                </PrivateRoute>
              }
            />
            <Route
              path="/manage-document-templates"
              element={
                <PrivateRoute>
                  <ManageDocumentTemplates />
                </PrivateRoute>
              }
            />

            {/* Перенаправление на главную страницу, если маршрут не найден */}
            <Route path="*" element={<Navigate to="/main" />} />
          </Routes>
        </UIProvider>
      </AuthProvider>
    </Router>
  )
}

export default App