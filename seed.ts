import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  // Reference IDs must come from the atomic Postgres function so they follow
  // the same MT-YYYY-XXXX format and counter as real submissions.
  const { data: referenceId, error: refError } = await supabase.rpc("generate_reference_id");
  if (refError) {
    console.error("Error generating reference ID:", refError);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      reference_id: referenceId,
      business_name: "Fashion Hub Bd",
      owner_name: "Mr. Nayeem",
      phone: "+8801700000000",
      whatsapp: "+8801700000000",
      email: "demo@fashionhub.com",
      category: "E-commerce",
      district: "Dhaka",
      business_description: "I need an e-commerce website for my clothing business. I would like to see a demo first. Thanks!",
      business_goals: ["Get more customers", "Online presence"],
      package: "business",
      pages: ["Home", "Products", "About", "Contact"],
      features: ["Online order", "Payment", "Customer login"],
      design_styles: ["Modern", "Minimal"],
      available_assets: ["Logo"],
      priority: "HOT",
      status: "New",
      budget_range: "৳15,000 – ৳25,000",
    })
    .select()
    .single();

  if (error) {
    console.error("Error inserting demo lead:", error);
    process.exit(1);
  }

  console.log(`Success! Demo lead added — ${data.reference_id} (id: ${data.id})`);
  process.exit(0);
}

seed();
