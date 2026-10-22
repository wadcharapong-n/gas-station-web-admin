import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { RequireRole } from './components/RequireRole'
import { AdminLayout } from './layouts/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { SettingsPage } from './pages/SettingsPage'
import { StationEditorPage } from './pages/StationEditorPage'
import { StationFuelPage } from './pages/StationFuelPage'
import { StationFuelTypesPage } from './pages/StationFuelTypesPage'
import { StationPricesPage } from './pages/StationPricesPage'
import { StationCreatePage } from './pages/StationCreatePage'
import { StationsListPage } from './pages/StationsListPage'
import { UsersPage } from './pages/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/stations"
              element={
                <RequireRole allow="corporate_admin">
                  <StationsListPage />
                </RequireRole>
              }
            />
            <Route
              path="/stations/new"
              element={
                <RequireRole allow="corporate_admin">
                  <StationCreatePage />
                </RequireRole>
              }
            />
            <Route
              path="/stations/:stationId"
              element={
                <RequireRole allow="corporate_admin">
                  <StationEditorPage />
                </RequireRole>
              }
            />
            <Route
              path="/stations/:stationId/prices"
              element={
                <RequireRole allow="corporate_admin">
                  <StationPricesPage />
                </RequireRole>
              }
            />
            <Route
              path="/stations/:stationId/fuel"
              element={
                <RequireRole allow="corporate_admin">
                  <StationFuelPage />
                </RequireRole>
              }
            />
            <Route
              path="/stations/:stationId/fuel-types"
              element={
                <RequireRole allow="corporate_admin">
                  <StationFuelTypesPage />
                </RequireRole>
              }
            />
            <Route
              path="/users"
              element={
                <RequireRole allow="corporate_admin">
                  <UsersPage />
                </RequireRole>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireRole allow="corporate_admin">
                  <SettingsPage />
                </RequireRole>
              }
            />
            <Route
              path="/my-station/profile"
              element={
                <RequireRole allow="station_manager">
                  <StationEditorPage mode="assigned" />
                </RequireRole>
              }
            />
            <Route
              path="/my-station/prices"
              element={
                <RequireRole allow="station_manager">
                  <StationPricesPage mode="assigned" />
                </RequireRole>
              }
            />
            <Route
              path="/my-station/fuel"
              element={
                <RequireRole allow="station_manager">
                  <StationFuelPage mode="assigned" />
                </RequireRole>
              }
            />
            <Route
              path="/my-station/fuel-types"
              element={
                <RequireRole allow="station_manager">
                  <StationFuelTypesPage mode="assigned" />
                </RequireRole>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
