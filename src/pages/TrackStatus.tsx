import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { supabase } from "@/supabase";

const STAGES = [
  "New",
  "Contacted",
  "Quotation Sent",
  "Negotiation",
  "Confirmed",
  "Development",
  "Review",
  "Completed",
];

interface StatusResult {
  referenceId: string;
  businessName: string;
  status: string;
  updatedAt: number;
}

export default function TrackStatus() {
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = refId.trim().toUpperCase();
    if (!cleaned) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: queryError } = await supabase
        .from("public_status")
        .select("reference_id, business_name, status, updated_at")
        .eq("reference_id", cleaned)
        .maybeSingle();

      if (queryError) throw queryError;

      if (!data) {
        setError("No project found with that reference ID. Please double-check and try again.");
      } else {
        setResult({
          referenceId: data.reference_id,
          businessName: data.business_name,
          status: data.status,
          updatedAt: new Date(data.updated_at).getTime(),
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = result
    ? result.status === "Cancelled"
      ? -1
      : Math.max(0, STAGES.indexOf(result.status))
    : -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-16 px-4">
      <div className="max-w-xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">
            Track Your Project
          </h1>
          <p className="text-neutral-500">
            Enter your reference ID to see where your website project currently stands.
          </p>
        </motion.div>

        <form onSubmit={handleSearch} className="relative mb-10">
          <input
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            placeholder="e.g. MT-2026-0001"
            className="w-full p-4 pl-12 bg-white border border-neutral-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-mono"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-red-500 text-sm font-medium"
            >
              {error}
            </motion.p>
          )}

          {result && (
            <motion.div
              key={result.referenceId}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8"
            >
              <p className="text-xs uppercase font-semibold text-neutral-400 mb-1">{result.referenceId}</p>
              <h2 className="text-2xl font-bold text-neutral-900 mb-8">{result.businessName}</h2>

              {result.status === "Cancelled" ? (
                <p className="text-red-500 font-semibold">This project request has been cancelled.</p>
              ) : (
                <div className="space-y-1">
                  {STAGES.map((stage, idx) => {
                    const done = idx < currentStageIndex;
                    const active = idx === currentStageIndex;
                    return (
                      <div key={stage} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <motion.div
                            initial={false}
                            animate={{
                              scale: active ? 1.2 : 1,
                              backgroundColor: done || active ? "#4f46e5" : "#e5e5e5",
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center relative"
                          >
                            {active && (
                              <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-60 animate-ping" />
                            )}
                            {done && <CheckCircle2 className="w-4 h-4 text-indigo-600 absolute -inset-0.5" />}
                          </motion.div>
                          {idx < STAGES.length - 1 && (
                            <div className={`w-0.5 h-8 ${done ? "bg-indigo-500" : "bg-neutral-200"}`} />
                          )}
                        </div>
                        <p
                          className={`text-sm pt-0.5 font-medium ${
                            active ? "text-indigo-600 font-bold" : done ? "text-neutral-700" : "text-neutral-400"
                          }`}
                        >
                          {stage}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
