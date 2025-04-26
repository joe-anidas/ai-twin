"use client";

import Navbar from "../components/opening/Navbar"; // Adjust the import path as necessary
// import { useContract } from "@/context/ContractContext";
import PublicModelsList from "@/components/PublicModelsList";

import Hero from "../components/opening/Hero";
import Contact from "../components/opening/Contact";


export default function Home() {
  // const { account } = useContract();
  return (
    <main>
      <Navbar /> 
      <Hero/>
      <PublicModelsList />
      <Contact />

    </main>
  );
}
