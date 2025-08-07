import React from "react";
import { Pricing } from "@/components/pricing";
import { NavBar } from "@/components/navbar";

export default function PricingPage() {
    return (
        <div className="bg-gradient-blue min-h-screen flex flex-col">
            <NavBar />
            <div className="flex-1">
                <Pricing />
            </div>
        </div>
    );
}