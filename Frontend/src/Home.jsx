import React from "react";
import LandingPage from "./Components/Nav/LandingPage";
import HeadSpaMobilePreview from "./Components/UI/HeadSpaMobilePreview";
import ServicesPreview from "./Components/UI/ServicesPreview";

function Home() {
  return (
    <div className="min-h-screen">
      <LandingPage />
      <HeadSpaMobilePreview />
      <ServicesPreview />
    </div>
  );
}

export default Home;
