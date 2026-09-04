import { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { rowToLead, leadToRow } from "@/lib/leadMapper";
import { Lead } from "@/types";
import { NumberTicker } from "@/components/ui/number-ticker";
import { format } from "date-fns";
import { Search, Filter, LogOut, FileText, Phone, Mail, MessageCircle, ArrowLeft, Send, Calendar, Loader2 } from "lucide-react";
import { generatePDF } from "@/lib/pdf";
import { motion, AnimatePresence } from "framer-motion";
import { buildWaMeLink, displayBDPhone } from "@/lib/phone";
import type { User } from "@supabase/supabase-js";

const PAGE_SIZE = 20;
const PACKAGE_PRICES: Record<string, number> = { starter: 8000, business: 15000, premium: 25000 };

// Only these email addresses may access the admin CRM.
// Set VITE_ADMIN_EMAILS in your .env.local (comma-separated, no spaces) — see .env.example.
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [newNote, setNewNote] = useState("");
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [quotation, setQuotation] = useState({
    domainCost: 0,
    hostingCost: 0,
    additionalCost: 0,
    discount: 0,
    paymentTerms: "",
    estimatedDelivery: "",
  });

  useEffect(() => {
    const applySession = async (sessionUser: User | null) => {
      const isAllowed = !!sessionUser?.email && ADMIN_EMAILS.includes(sessionUser.email.toLowerCase());

      if (sessionUser && !isAllowed) {
        // Signed in, but not on the admin allowlist — kick them out.
        await supabase.auth.signOut();
        setUser(null);
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      setUnauthorized(false);
      setUser(sessionUser);
      setLoading(false);
      if (sessionUser) fetchLeads();
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session?.user ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) setLoginError(error.message);
    setLoggingIn(false);
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);
    if (!error && data) {
      const rows = data.map(rowToLead);
      setLeads(rows);
      setHasMore(rows.length === PAGE_SIZE);
    }
    setLeadsLoading(false);
  };

  const loadMoreLeads = async () => {
    setLoadingMore(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .range(leads.length, leads.length + PAGE_SIZE - 1);
    if (!error && data) {
      const rows = data.map(rowToLead);
      setLeads(prev => [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
    }
    setLoadingMore(false);
  };

  const updateLeadStatus = async (id: string, referenceId: string, status: string) => {
    // public_status is kept in sync automatically by a database trigger.
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    if (selectedLead && selectedLead.id === id) setSelectedLead({ ...selectedLead, status });
  };

  const updatePriority = async (id: string, priority: string) => {
    await supabase.from("leads").update({ priority }).eq("id", id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, priority } : l));
    if (selectedLead && selectedLead.id === id) setSelectedLead({ ...selectedLead, priority });
  };

  const handleAddNote = async (leadId: string) => {
    if (!newNote.trim() || !selectedLead) return;
    const note = { note: newNote, addedAt: Date.now() };
    const updatedNotes = [...(selectedLead.adminNotes || []), note];

    await supabase.from("leads").update({ admin_notes: updatedNotes }).eq("id", leadId);
    setSelectedLead({ ...selectedLead, adminNotes: updatedNotes });
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, adminNotes: updatedNotes } : l));
    setNewNote("");
  };

  const handleDownloadPDF = async (lead: Lead) => {
    await generatePDF(lead);
  };

  const openLead = (lead: Lead) => {
    setSelectedLead(lead);
    setQuotation({
      domainCost: lead.quotation?.domainCost || 0,
      hostingCost: lead.quotation?.hostingCost || 0,
      additionalCost: lead.quotation?.additionalCost || 0,
      discount: lead.quotation?.discount || 0,
      paymentTerms: lead.quotation?.paymentTerms || "",
      estimatedDelivery: lead.quotation?.estimatedDelivery || "",
    });
  };

  const basePrice = selectedLead ? (PACKAGE_PRICES[selectedLead.package] || 0) : 0;
  const subtotal = basePrice + quotation.domainCost + quotation.hostingCost + quotation.additionalCost;
  const finalTotal = Math.max(0, subtotal - quotation.discount);

  const saveQuotation = async () => {
    if (!selectedLead) return;
    const quotationData = {
      basePrice,
      domainCost: quotation.domainCost,
      hostingCost: quotation.hostingCost,
      additionalCost: quotation.additionalCost,
      discount: quotation.discount,
      finalTotal,
      paymentTerms: quotation.paymentTerms,
      estimatedDelivery: quotation.estimatedDelivery,
    };
    await supabase.from("leads").update({ quotation: quotationData }).eq("id", selectedLead.id);
    setSelectedLead({ ...selectedLead, quotation: quotationData });
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, quotation: quotationData } : l));
  };

  const sendQuotationEmail = () => {
    if (!selectedLead) return;
    const subject = `Your MT Web Studio Project Quotation — ${selectedLead.referenceId}`;
    const body = [
      `Hi ${selectedLead.ownerName},`,
      ``,
      `Thank you for choosing MT Web Studio. Here is your project quotation:`,
      ``,
      `Package (${selectedLead.package}): ৳${basePrice.toLocaleString()}`,
      quotation.domainCost ? `Domain: ৳${quotation.domainCost.toLocaleString()}` : null,
      quotation.hostingCost ? `Hosting: ৳${quotation.hostingCost.toLocaleString()}` : null,
      quotation.additionalCost ? `Additional Features: ৳${quotation.additionalCost.toLocaleString()}` : null,
      quotation.discount ? `Discount: -৳${quotation.discount.toLocaleString()}` : null,
      `Total: ৳${finalTotal.toLocaleString()}`,
      ``,
      quotation.paymentTerms ? `Payment Terms: ${quotation.paymentTerms}` : null,
      quotation.estimatedDelivery ? `Estimated Delivery: ${quotation.estimatedDelivery}` : null,
      ``,
      `Reference ID: ${selectedLead.referenceId}`,
      ``,
      `Best regards,`,
      `MT Web Studio`,
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:${selectedLead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl text-center"
        >
          <h2 className="text-3xl font-bold mb-2">Admin Login</h2>
          <p className="text-neutral-500 mb-8">MT Web Studio CRM</p>
          {unauthorized && (
            <p className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl py-3 px-4">
              This account is not authorized for admin access.
            </p>
          )}
          {loginError && (
            <p className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl py-3 px-4">
              {loginError}
            </p>
          )}
          <form onSubmit={handleLogin} className="text-left space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-neutral-700">Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="admin@mtwebstudio.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-neutral-700">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              {loggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "New").length,
    hot: leads.filter(l => l.priority === "HOT").length,
    inProgress: leads.filter(l => ["Development", "Review", "Negotiation"].includes(l.status)).length
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (selectedLead) {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="min-h-screen bg-neutral-50 relative overflow-hidden">
        <div className="absolute top-0 left-10 w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob pointer-events-none z-0"></div>
        <div className="absolute top-0 right-10 w-[600px] h-[600px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none z-0"></div>
        
        <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setSelectedLead(null)} className="flex items-center gap-2 text-neutral-600 font-semibold hover:text-neutral-900">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => handleDownloadPDF(selectedLead)} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100">
              <FileText className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-1">{selectedLead.businessName}</h2>
                  <p className="text-neutral-500 font-medium">Ref: {selectedLead.referenceId} • {format(selectedLead.createdAt, "PPP")}</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedLead.priority}
                    onChange={(e) => updatePriority(selectedLead.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border outline-none ${
                      selectedLead.priority === 'HOT' ? 'bg-red-50 text-red-600 border-red-200' :
                      selectedLead.priority === 'WARM' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }`}
                  >
                    <option value="HOT">HOT</option>
                    <option value="WARM">WARM</option>
                    <option value="COLD">COLD</option>
                  </select>
                  <select 
                    value={selectedLead.status}
                    onChange={(e) => updateLeadStatus(selectedLead.id, selectedLead.referenceId, e.target.value)}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 border border-neutral-200 text-neutral-700 outline-none"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Quotation Sent">Quotation Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Development">Development</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Package</p>
                  <p className="font-semibold capitalize">{selectedLead.package}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Category</p>
                  <p className="font-semibold">{selectedLead.category}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Location</p>
                  <p className="font-semibold">{selectedLead.district}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-bold uppercase mb-1">Budget</p>
                  <p className="font-semibold">{selectedLead.budgetRange || "Not set"}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <p className="text-neutral-700">{selectedLead.businessDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-2">Pages</h3>
                    <ul className="list-disc pl-5 text-neutral-700">
                      {(selectedLead.pages || []).map(p => <li key={p}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Features</h3>
                    <ul className="list-disc pl-5 text-neutral-700">
                      {(selectedLead.features || []).map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Contact Info</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500 font-semibold">Owner</p>
                  <p className="font-bold">{selectedLead.ownerName}</p>
                </div>
                <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-neutral-400" />
                    <span className="font-semibold">{displayBDPhone(selectedLead.phone)}</span>
                  </div>
                  <a href={`tel:${selectedLead.phone}`} className="text-indigo-600 font-bold text-sm">Call</a>
                </div>
                {selectedLead.whatsapp && (
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold">{displayBDPhone(selectedLead.whatsapp)}</span>
                    </div>
                    {buildWaMeLink(selectedLead.whatsapp) ? (
                      <a href={buildWaMeLink(selectedLead.whatsapp)!} target="_blank" rel="noreferrer" className="text-green-600 font-bold text-sm">Chat</a>
                    ) : (
                      <span className="text-neutral-400 text-xs">Invalid number</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-neutral-400" />
                    <span className="font-semibold truncate max-w-[150px]">{selectedLead.email}</span>
                  </div>
                  <a href={`mailto:${selectedLead.email}`} className="text-indigo-600 font-bold text-sm">Email</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Quotation Preparation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  <span className="text-neutral-600 font-semibold text-sm">Base Price ({selectedLead.package})</span>
                  <span className="font-extrabold text-neutral-900">৳{basePrice.toLocaleString()}</span>
                </div>

                {[
                  { key: "domainCost", label: "Domain Cost" },
                  { key: "hostingCost", label: "Hosting Cost" },
                  { key: "additionalCost", label: "Additional Feature Cost" },
                  { key: "discount", label: "Discount" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-neutral-600">{label}</label>
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">৳</span>
                      <input
                        type="number"
                        min={0}
                        value={(quotation as any)[key]}
                        onChange={(e) => setQuotation(prev => ({ ...prev, [key]: Number(e.target.value) || 0 }))}
                        className="w-full pl-6 pr-2 py-2 text-sm text-right bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-neutral-100 space-y-1">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-indigo-600">
                    <span>Final Total</span>
                    <motion.span key={finalTotal}>৳{finalTotal.toLocaleString()}</motion.span>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Payment Terms (e.g. 50% advance, 50% on delivery)"
                  value={quotation.paymentTerms}
                  onChange={(e) => setQuotation(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="w-full mt-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Estimated Delivery (internal only)"
                  value={quotation.estimatedDelivery}
                  onChange={(e) => setQuotation(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-xs text-neutral-400">Internal only — never auto-promised to the client.</p>

                <button onClick={saveQuotation} className="w-full py-3 bg-neutral-100 text-neutral-800 rounded-xl font-bold hover:bg-neutral-200 mt-2 transition-colors">
                  Save Quotation
                </button>
                <button onClick={sendQuotationEmail} className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors">
                  Send Quotation Email
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Internal Notes</h3>
              <div className="space-y-4 mb-4 max-h-[200px] overflow-y-auto pr-2">
                {(selectedLead.adminNotes || []).length === 0 ? (
                  <p className="text-sm text-neutral-400 text-center py-4">No internal notes yet.</p>
                ) : (
                  (selectedLead.adminNotes || []).map((n, i) => (
                    <div key={i} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                      <p className="text-sm text-neutral-700">{n.note}</p>
                      <p className="text-xs text-neutral-400 mt-2 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {format(n.addedAt, "MMM d, h:mm a")}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..." 
                  className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote(selectedLead.id)}
                />
                <button 
                  onClick={() => handleAddNote(selectedLead.id)}
                  disabled={!newNote.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 relative overflow-hidden">
      <div className="absolute top-0 left-10 w-[600px] h-[600px] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob pointer-events-none z-0"></div>
      <div className="absolute top-0 right-10 w-[600px] h-[600px] bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none z-0"></div>
      
      <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-neutral-900">MT Web Studio <span className="text-neutral-400 font-medium">| CRM</span></h1>
        <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-semibold text-sm">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", val: stats.total, color: "text-indigo-600" },
            { label: "New Requests", val: stats.new, color: "text-blue-600" },
            { label: "Hot Leads", val: stats.hot, color: "text-red-600" },
            { label: "In Progress", val: stats.inProgress, color: "text-green-600" }
          ].map((stat, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:-translate-y-1 transition-transform"
            >
              <p className="text-sm font-bold text-neutral-500 uppercase mb-2">{stat.label}</p>
              <div className={`text-4xl font-extrabold ${stat.color}`}>
                <NumberTicker value={stat.val} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-50">
            <h2 className="font-bold text-lg text-neutral-900">Recent Leads</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ref, email..." 
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm" 
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm appearance-none outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quotation Sent">Quotation Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Development">Development</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Business</th>
                  <th className="px-6 py-4">Package</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {leadsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 rounded-full bg-neutral-100 overflow-hidden relative">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                <>
                <AnimatePresence>
                  {filteredLeads.map((lead, idx) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.05, duration: 0.2 }}
                      key={lead.id} 
                      className="hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                      onClick={() => openLead(lead)}
                    >
                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">{lead.referenceId}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900 group-hover:text-indigo-700 transition-colors">{lead.businessName}</p>
                      <p className="text-neutral-500 text-xs flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3"/> {lead.email}</p>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold text-neutral-700">{lead.package}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        lead.priority === 'HOT' ? 'bg-red-50 text-red-600 border-red-200' :
                        lead.priority === 'WARM' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                        'bg-blue-50 text-blue-600 border-blue-200'
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium whitespace-nowrap">
                      {format(lead.createdAt, "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); openLead(lead); }} className="text-indigo-600 font-bold hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details
                      </button>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4">
                        <Search className="w-8 h-8 text-neutral-400" />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 mb-1">No leads found</h3>
                      <p className="text-neutral-500 max-w-sm mx-auto">
                        {leads.length === 0 ? "Waiting for your first customer submission!" : "Try adjusting your search or filter criteria."}
                      </p>
                    </td>
                  </tr>
                )}
                </>
                )}
              </tbody>
            </table>
          </div>
          {!leadsLoading && hasMore && searchTerm === "" && filterStatus === "All" && (
            <div className="p-4 border-t border-neutral-100 flex justify-center">
              <button
                onClick={loadMoreLeads}
                disabled={loadingMore}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-sm hover:bg-neutral-200 transition-colors disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingMore ? "Loading..." : "Load More Leads"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
