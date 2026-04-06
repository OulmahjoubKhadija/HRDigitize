import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import "./Navbar.css";
import HRD from "../assets/HRD.png";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [ribbonStyle, setRibbonStyle] = useState({});
  const navRef = useRef(null);
  const linkRefs = useRef({});

  if (loading) return null;

  const employees = ["RH", "SALARIE", "CHEF_SERVICE"];
  const isEmployee = user && employees.includes(user.role);
  const isStagiaire = user && user.role === "STAGIAIRE";

  // Function to update ribbon position
  const updateRibbonPosition = () => {
    if (!navRef.current) return;
    const currentPath = location.pathname;
    let activeLink = linkRefs.current[currentPath] || null;

    if (activeLink) {
      const { offsetLeft, offsetWidth } = activeLink;
      setRibbonStyle({
        width: `${offsetWidth}px`,
        transform: `translateX(${offsetLeft}px)`,
        opacity: 1,
      });
    } else {
      setRibbonStyle({ opacity: 0 });
    }
  };

  useEffect(() => {
    const timer = setTimeout(updateRibbonPosition, 10);
    return () => clearTimeout(timer);
  }, [location.pathname, user]);

  const setLinkRef = (path, el) => {
    if (el) linkRefs.current[path] = el;
  };

  // ---------------------
  // Build Links Dynamically
  // ---------------------
  let links = [];

  if (!user) {
  // Guest
  links = [
    { label: "Accueil", to: "/" },
    { label: "Connexion", to: "/login" },
    { label: "Inscrire", to: "/activate-account" },
  ];

} else if (user.role === "RH") {
  // RH ONLY
  links = [
    { label: "Accueil", to: "/" },
    { label: "Gestion", to: "/dashboard" },
    { label: "Archives", to: "/archives" },
    { label: "Créer un Documents", to: "/type-documents" },
    { label: "Créer un Modél", to: "/document-templates" },
    { label: "Demandes", to: "/demandes" },
    { label: "Mes Demandes", to: "/mes-demandes" },
    { label: "Generer les Documents", to: "/generate-document" },
    { label: "Créer un Employé", to: "/rh/create-employee" },
    { label: "Créer un Stagiaire", to: "/create-intern" },
    { label: "Créer une Société", to: "/rh/create-societe" },
    { label: "Créer un Service", to: "/rh/create-service" },
    { label: "Mon Profil", to: "/profile" },
    { label: "Déconnexion", action: logout },
  ];

} else if (user.role === "SALARIE" || user.role === "CHEF_SERVICE") {
  // Other employees
  links = [
    { label: "Accueil", to: "/" },
    { label: "Gestion", to: "/dashboard" },
    { label: "Créer un Stagiaire", to: "/create-intern" },
    { label: "Mes Demandes", to: "/mes-demandes" },
    { label: "Generer les Documents", to: "/generate-document" },
    { label: "Mon Profil", to: "/profile" },
    { label: "Déconnexion", action: logout },
  ];

} else if (user.role === "STAGIAIRE") {
  if (!user.is_profile_completed) {
    links = [
      { label: "Compléter le profil", to: "/stagiaire/complete-profile" },
      { label: "Déconnexion", action: logout },
    ];
  } else {
    links = [
      { label: "Accueil", to: "/" },
      { label: "Mon Profil", to: "/stagiaire/profile" },  
      { label: "Mes Demandes", to: "/mes-demandes" },
      { label: "Déconnexion", action: logout },
    ];
  }
}


  return (
    <nav className="navbar" ref={navRef}>
      <img src={HRD} alt="HRDigitaze Logo" className="navbar-logo" />

      <div className="nav-right">
        <div className="nav-ribbon" style={ribbonStyle}></div>

        {links.map((link, idx) =>
          link.to ? (
            <Link
              key={idx}
              to={link.to}
              ref={(el) => setLinkRef(link.to, el)}
            >
              {link.label}
            </Link>
          ) : (
            <button
              key={idx}
              onClick={link.action}
              className="nav-logout"
            >
              {link.label}
            </button>
          )
        )}
      </div>
    </nav>
  );
}
