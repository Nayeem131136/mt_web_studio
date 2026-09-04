import { Lead } from "@/types";
import { pdf, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import notoBengaliRegular from "@/assets/fonts/NotoSansBengali-Regular.woff?url";
import notoBengaliBold from "@/assets/fonts/NotoSansBengali-Bold.woff?url";

// Register a Bengali-capable font so business descriptions, notes, etc. that the
// client typed in Bangla render correctly instead of showing blank boxes.
Font.register({
  family: "NotoSansBengali",
  fonts: [
    { src: notoBengaliRegular, fontWeight: "normal" },
    { src: notoBengaliBold, fontWeight: "bold" },
  ],
});

const BENGALI_RANGE = /[\u0980-\u09FF]/;

/**
 * Renders a string that may mix Bangla and English by splitting it into runs
 * and rendering each run with the font that actually has glyphs for it —
 * Helvetica has no Bengali glyphs, and the Bengali-subset font has no Latin
 * glyphs, so a single font can't render mixed-script client input correctly.
 */
function MixedText({ text, style, bold }: { text: string; style?: any; bold?: boolean }) {
  if (!text) return <Text style={style} />;

  const runs: { text: string; bengali: boolean }[] = [];
  let current = "";
  let currentIsBengali: boolean | null = null;

  for (const char of text) {
    const isBengali = BENGALI_RANGE.test(char);
    if (currentIsBengali === null) currentIsBengali = isBengali;
    if (isBengali === currentIsBengali) {
      current += char;
    } else {
      runs.push({ text: current, bengali: currentIsBengali });
      current = char;
      currentIsBengali = isBengali;
    }
  }
  if (current) runs.push({ text: current, bengali: !!currentIsBengali });

  return (
    <Text style={style}>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={{
            fontFamily: run.bengali ? "NotoSansBengali" : "Helvetica" + (bold ? "-Bold" : ""),
            fontWeight: bold ? "bold" : "normal",
          }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  page: { padding: 40, paddingBottom: 60, fontFamily: "Helvetica", fontSize: 10.5, color: "#333" },
  header: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: "#4F46E5", paddingBottom: 14 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#111" },
  tagline: { fontSize: 9, color: "#888", marginTop: 2 },
  subtitle: { fontSize: 12, color: "#4F46E5", fontFamily: "Helvetica-Bold", marginTop: 10 },
  metaBox: { alignItems: "flex-end" },
  metaText: { fontSize: 9, color: "#666" },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 8, color: "#4F46E5", borderBottomWidth: 1, borderBottomColor: "#EEF0FF", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 6 },
  label: { width: "34%", fontFamily: "Helvetica-Bold", color: "#555" },
  value: { width: "66%" },
  badge: { backgroundColor: "#EEF0FF", color: "#4F46E5", fontFamily: "Helvetica-Bold", fontSize: 11, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, alignSelf: "flex-start" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#F5F5F7", color: "#333", fontSize: 9.5, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, marginRight: 6, marginBottom: 6 },
  note: { fontSize: 9, color: "#999", marginTop: 4, fontFamily: "Helvetica-Oblique" },
  footer: { position: "absolute", bottom: 24, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8.5, color: "#aaa", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  confirmBox: { marginTop: 16, padding: 10, backgroundColor: "#F5F5F7", borderRadius: 4 },
});

const packagePrice: Record<string, string> = { starter: "৳8,000", business: "৳15,000", premium: "৳25,000" };

function Chips({ items }: { items?: string[] }) {
  if (!items || items.length === 0) return <Text style={styles.value}>—</Text>;
  return (
    <View style={[styles.chipRow, styles.value]}>
      {items.map((item, i) => (
        <Text key={i} style={styles.chip}>{item}</Text>
      ))}
    </View>
  );
}

const ProjectDocument = ({ lead }: { lead: Lead }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.title}>MT Web Studio</Text>
            <Text style={styles.tagline}>Professional Websites That Grow Your Business.</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>Reference ID: {lead.referenceId}</Text>
            <Text style={styles.metaText}>Date: {format(lead.createdAt, "PPP")}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>CLIENT PROJECT REQUIREMENT DOCUMENT</Text>
      </View>

      <Text style={styles.sectionTitle}>1. Business Information</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Business Name:</Text>
        <MixedText text={lead.businessName} style={styles.value} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Owner / Contact:</Text>
        <MixedText text={lead.ownerName} style={styles.value} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>{lead.category}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Location:</Text>
        <MixedText text={[lead.district, lead.address].filter(Boolean).join(", ")} style={styles.value} />
      </View>
      {lead.socialLinks ? (
        <View style={styles.row}>
          <Text style={styles.label}>Social / Existing Web:</Text>
          <Text style={styles.value}>{lead.socialLinks}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.label}>Description:</Text>
        <MixedText text={lead.businessDescription} style={styles.value} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Business Goals:</Text>
        <Chips items={lead.businessGoals} />
      </View>

      <Text style={styles.sectionTitle}>2. Contact Information</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{lead.phone}</Text>
      </View>
      {lead.whatsapp ? (
        <View style={styles.row}>
          <Text style={styles.label}>WhatsApp:</Text>
          <Text style={styles.value}>{lead.whatsapp}</Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{lead.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>3. Selected Package</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Package:</Text>
        <View style={styles.value}>
          <Text style={styles.badge}>{lead.package.toUpperCase()} — {packagePrice[lead.package] || ""}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Domain:</Text>
        <Text style={styles.value}>
          {lead.domainStatus?.replace(/_/g, " ") || "—"}{lead.domainName ? ` (${lead.domainName})` : ""} — Separate cost
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Hosting:</Text>
        <Text style={styles.value}>
          {lead.hostingStatus?.replace(/_/g, " ") || "—"}{lead.hostingProvider ? ` (${lead.hostingProvider})` : ""} — Separate cost
        </Text>
      </View>
      <Text style={styles.note}>Domain & hosting charges depend on the provider and selected plan, and are separate from the website development package.</Text>

      <Text style={styles.sectionTitle}>4. Requested Pages & Features</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Pages:</Text>
        <Chips items={lead.pages} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Features:</Text>
        <Chips items={lead.features} />
      </View>

      <Text style={styles.sectionTitle}>5. Design Preferences</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Styles:</Text>
        <Chips items={lead.designStyles} />
      </View>
      {lead.colorPreferences ? (
        <View style={styles.row}>
          <Text style={styles.label}>Colors:</Text>
          <Text style={styles.value}>{lead.colorPreferences}</Text>
        </View>
      ) : null}
      {lead.referenceUrls ? (
        <View style={styles.row}>
          <Text style={styles.label}>Reference Sites:</Text>
          <MixedText text={lead.referenceUrls} style={styles.value} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>6. Content & Project Details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Content Readiness:</Text>
        <Text style={styles.value}>{lead.contentReadiness || "—"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Available Assets:</Text>
        <Chips items={lead.availableAssets} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Uploaded Files:</Text>
        <Text style={styles.value}>
          {lead.uploadedFiles && lead.uploadedFiles.length > 0
            ? `${lead.uploadedFiles.length} file(s) uploaded — see admin dashboard for downloads`
            : "None uploaded"}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Launch Date:</Text>
        <Text style={styles.value}>{lead.launchDate || "Not specified"}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Budget Range:</Text>
        <Text style={styles.value}>{lead.budgetRange || "Not specified"}</Text>
      </View>
      {lead.additionalNotes ? (
        <View style={styles.row}>
          <Text style={styles.label}>Additional Notes:</Text>
          <MixedText text={lead.additionalNotes} style={styles.value} />
        </View>
      ) : null}

      <View style={styles.confirmBox}>
        <Text style={{ fontSize: 9.5 }}>
          ✓ Client confirmed the information provided is accurate and agreed to be contacted by MT Web Studio regarding this project.
        </Text>
      </View>

      <Text
        style={styles.footer}
        render={({ pageNumber, totalPages }) => `MT Web Studio · ${lead.referenceId} · Page ${pageNumber} of ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
);

export const generatePDF = async (lead: Lead) => {
  try {
    const blob = await pdf(<ProjectDocument lead={lead} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lead.referenceId}-Requirements.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch(e) {
    console.error("PDF gen failed", e);
  }
};
