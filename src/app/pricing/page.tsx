import React from "react";
import { Pricing } from "@/components/pricing";
import { NavBar } from "@/components/navbar";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-solid-cream">
            <NavBar />
            <main className="pt-16">
                <Pricing />
            </main>
        </div>
    );
}