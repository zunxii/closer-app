"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export default function CampaignDetail() {
  const params = useParams();
  const id = params?.id as string;

  const [campaign, setCampaign] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    email: "",
    instagram: "",
    product: "",
    brand: "",
    deliverables: "",
    cost: "",
    website: "",
    personalization: "",
  });

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        const found = data.items?.find((c: any) => c.id === id);
        setCampaign(found);
      });
  }, [id]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSuccess(false);
    const res = await fetch("/api/add-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaign_id: id,
        ...form,
      }),
    });

    const result = await res.json();

    if (res.ok) {
      setSuccess(true);
      setForm({
        first_name: "",
        email: "",
        instagram: "",
        product: "",
        brand: "",
        deliverables: "",
        cost: "",
        website: "",
        personalization: "",
      });
    } else {
      alert(`❌ Failed: ${result?.message || "Unknown error"}`);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Add Lead to:{" "}
        <span className="text-blue-600">{campaign?.name || "..."}</span>
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {Object.entries(form).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <label
              htmlFor={key}
              className="mb-1 text-sm font-medium text-gray-700 capitalize"
            >
              {key.replace(/_/g, " ")}
            </label>
            <input
              id={key}
              type="text"
              value={value}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={`Enter ${key.replace(/_/g, " ")}`}
              className="border border-gray-300 text-black rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
        ))}

        <div className="col-span-full mt-4 flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="animate-spin w-5 h-5" />}
            {isSubmitting ? "Adding Lead..." : "Add Lead"}
          </button>
        </div>

        {success && (
          <div className="col-span-full text-center mt-4 text-green-600 text-sm animate-fade-in">
            <CheckCircle className="inline mr-2 h-5 w-5" />
            Lead added successfully!
          </div>
        )}
      </form>
    </div>
  );
}
