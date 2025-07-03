"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { defaultRow } from "@/components/influencers/data";
import { Creator } from "@/components/influencers/types";
import ToggleButtons from "@/components/influencers/ToggleButtons";
import MatchForm from "@/components/influencers/MatchForm";
import AddForm from "@/components/influencers/AddForm";

const Influencers = () => {
  const [formToggle, setFormToggle] = useState<"match" | "add">("match");

  return (
    // <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <ToggleButtons formToggle={formToggle} setFormToggle={setFormToggle} />
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {formToggle === "match" ? <MatchForm /> : <AddForm />}
        </div>
      </div>
    // </div>
  );
};

export default Influencers;
