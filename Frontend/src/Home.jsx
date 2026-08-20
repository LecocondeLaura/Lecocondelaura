import React from "react";
import LandingPage from "./Components/Nav/LandingPage";
import ServicesPreview from "./Components/UI/ServicesPreview";

function Home() {
  return (
    <div className="min-h-screen">
      <LandingPage />
      <ServicesPreview />
    </div>
  );
}

export default Home;
