"use client";

import { useState } from "react";
import ToggleButtons from "@/components/influencers/ToggleButtons";
import MatchForm from "@/components/influencers/MatchForm";
import AddForm from "@/components/influencers/AddForm";
import EditForm from "@/components/influencers/EditForm";

const Influencers = () => {
  const [formToggle, setFormToggle] = useState<"match" | "add" | "edit">(
    "match"
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ToggleButtons formToggle={formToggle} setFormToggle={setFormToggle} />
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {formToggle === "match" && <MatchForm />}
        {formToggle === "add" && <AddForm />}
        {formToggle === "edit" && <EditForm />}
      </div>
    </div>
  );
};

export default Influencers;
