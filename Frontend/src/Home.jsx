import React from "react";
import LandingPage from "./Components/Nav/LandingPage";
import NoticeCard from "./Components/Nav/NoticeCard";
import ServicesPreview from "./Components/UI/ServicesPreview";
function Home() {
  return (
    <div className="min-h-screen">
      <LandingPage />
      <ServicesPreview />
      <NoticeCard />
    </div>
  );
}

export default Home;
