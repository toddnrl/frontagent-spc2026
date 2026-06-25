"use client";

import { CustomRAG } from "./CustomRAG";
import { DeveloperAPI } from "./DeveloperAPI";
import { Features } from "./Features";
import { FloatingButton } from "./FloatingButton";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { OperationsControl } from "./OperationsControl";
import { ReservationFeature } from "./ReservationFeature";

export function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ReservationFeature />
        <CustomRAG />
        <OperationsControl />
        <DeveloperAPI />
      </main>
      <Footer />
      <FloatingButton />
    </div>
  );
}
