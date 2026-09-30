// Shared knowledge base for the NorthWind Insurance scenario.
// Small, hand-authored corpus so every retrieval demo runs offline and is deterministic.

export type Doc = {
  id: string;
  title: string;
  source: string;
  policy: string;
  text: string;
  updated: string;
};

export const CORPUS: Doc[] = [
  {
    id: "POL-100",
    title: "Auto Policy — Windshield & Glass Coverage",
    source: "policy_handbook.pdf",
    policy: "Auto",
    updated: "2026-06-01",
    text: "Comprehensive coverage includes repair or replacement of windshield and window glass. For policies with the Glass Rider, the deductible for glass-only claims is waived. Standard comprehensive deductible is $250 and applies if the entire windshield is replaced without the rider. Chip repairs are covered at 100% with no deductible.",
  },
  {
    id: "POL-104",
    title: "Auto Policy — Rental Reimbursement",
    source: "policy_handbook.pdf",
    policy: "Auto",
    updated: "2026-06-01",
    text: "Rental reimbursement pays up to $40 per day for a maximum of 30 days while your covered vehicle is being repaired after a covered loss. Coverage must be added before the loss occurs. It does not apply to routine maintenance.",
  },
  {
    id: "CLM-200",
    title: "Claims Process — Filing a Glass Claim",
    source: "claims_guide.pdf",
    policy: "Claims",
    updated: "2026-08-12",
    text: "To file a glass claim: (1) report the damage in the portal or app, (2) select an approved glass vendor, (3) the vendor bills NorthWind directly. Most glass claims are approved within 24 hours. You do not need to pay upfront when using an approved vendor if your deductible is waived.",
  },
  {
    id: "CLM-205",
    title: "Claims Process — Status & SLAs",
    source: "claims_guide.pdf",
    policy: "Claims",
    updated: "2026-08-12",
    text: "Claim decisions are communicated within 3 business days for standard claims and 24 hours for glass-only claims. Customers can check status in the portal. Escalations are handled by a human adjuster when a claim exceeds $5,000 or involves injury.",
  },
  {
    id: "BIL-300",
    title: "Billing — Deductibles Explained",
    source: "billing_faq.pdf",
    policy: "Billing",
    updated: "2026-05-20",
    text: "A deductible is the amount you pay out of pocket before insurance pays the rest. Auto comprehensive deductibles range from $100 to $1,000 depending on your plan. Lower deductibles mean higher premiums. Deductibles may be waived for specific covered events such as glass repair with the Glass Rider.",
  },
  {
    id: "BIL-305",
    title: "Billing — Premium Payment Options",
    source: "billing_faq.pdf",
    policy: "Billing",
    updated: "2026-05-20",
    text: "Premiums can be paid monthly, quarterly, or annually. Annual payment gives a 5% discount. Auto-pay avoids a $4 monthly processing fee. Late payments over 30 days may cause a lapse in coverage.",
  },
  {
    id: "PRV-400",
    title: "Privacy — Handling of Personal Information",
    source: "privacy_policy.pdf",
    policy: "Privacy",
    updated: "2026-01-15",
    text: "NorthWind collects policyholder data including name, address, and vehicle details to service policies. Personally identifiable information is encrypted at rest and in transit. Support agents and AI systems must not expose full policy numbers, SSNs, or payment card data in responses. Data is retained for 7 years after policy termination.",
  },
  {
    id: "PRD-500",
    title: "Product — Glass Rider Add-on",
    source: "product_catalog.pdf",
    policy: "Auto",
    updated: "2026-07-02",
    text: "The Glass Rider is an optional add-on for $6/month that waives the deductible on all glass-only claims and provides unlimited chip repairs. It can be added mid-term and takes effect immediately upon payment.",
  },
];

// The scenario the whole workshop revolves around.
export const SCENARIO = {
  company: "NorthWind Insurance",
  role: "Support & Compliance Assistant",
  customerQuestion:
    "My windshield cracked on the highway. Do I have to pay the $250 deductible, and how fast can I get it fixed?",
  customerId: "CUST-88213",
  hiddenContext:
    "This customer has the Glass Rider add-on on their Auto policy, purchased last month.",
};

// A tiny stopword list for the toy keyword scorer.
const STOP = new Set([
  "the", "a", "an", "to", "of", "and", "or", "is", "are", "do", "i", "my",
  "how", "can", "get", "it", "on", "for", "in", "have", "does", "with",
  "what", "when", "where", "which", "you", "your", "be", "this", "that",
]);

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t));
}
