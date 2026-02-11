import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Home from "./Home";
import About from "./Pages/About";
import Contact from "./Pages/Contact";
import Services from "./Pages/Services";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import Clients from "./Pages/Clients";
import GiftCards from "./Pages/GiftCards";
import Agenda from "./Pages/Agenda";
import Conges from "./Pages/Conges";
import Header from "./Components/Nav/Header";
import Footer from "./Components/Nav/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import ScrollToTop from "./Components/ScrollToTop";
import MentionsLegales from "./Pages/MentionsLegales";
import PolitiqueConfidentialite from "./Pages/PolitiqueConfidentialite";

function App() {
  return (
    <ToastProvider>
      <NotificationProvider>
        <Router>
        <ScrollToTop />
        <Routes>
          {/* Routes publiques avec Header et Footer */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Header />
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Header />
                <Contact />
                <Footer />
              </>
            }
          />
          <Route
            path="/services"
            element={
              <>
                <Header />
                <Services />
                <Footer />
              </>
            }
          />
          <Route
            path="/mentions-legales"
            element={
              <>
                <Header />
                <MentionsLegales />
                <Footer />
              </>
            }
          />
          <Route
            path="/politique-confidentialite"
            element={
              <>
                <Header />
                <PolitiqueConfidentialite />
                <Footer />
              </>
            }
          />
          {/* Route de login (sans Header/Footer) */}
          <Route path="/login" element={<Login />} />
          {/* Routes protégées Dashboard (sans Header/Footer) */}
          <Route
            path="/dashboard/agenda"
            element={
              <ProtectedRoute>
                <Agenda />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/cartes-cadeaux"
            element={
              <ProtectedRoute>
                <GiftCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/conges"
            element={
              <ProtectedRoute>
                <Conges />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      </NotificationProvider>
    </ToastProvider>
  );
}

export default App;
