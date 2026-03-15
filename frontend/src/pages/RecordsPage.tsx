import { FileText, Search, Plus, Calendar } from "lucide-react";

const records = [
  { id: "EHR-0147", patient: "Marie Kabila", type: "Visit Log", date: "2026-03-09", summary: "BP check: 180/110, prescribed amlodipine 5mg, urgent referral initiated" },
  { id: "EHR-0146", patient: "Claude Banza", type: "Diagnosis", date: "2026-03-09", summary: "Severe respiratory infection confirmed, antibiotics prescribed, referral to specialist" },
  { id: "EHR-0145", patient: "Berthe Nyota", type: "Antenatal", date: "2026-03-08", summary: "Week 32 checkup - fetal heartbeat normal, weight gain on track, next visit scheduled" },
  { id: "EHR-0144", patient: "Joseph Mulamba", type: "Follow-up", date: "2026-03-08", summary: "Malaria recovery - symptoms resolved, blood test normal, cleared for discharge" },
  { id: "EHR-0143", patient: "Pascal Ilunga", type: "Vitals", date: "2026-03-07", summary: "Blood sugar: 145 mg/dL (fasting), adjusted metformin dosage" },
  { id: "EHR-0142", patient: "Amani Kayembe", type: "Immunization", date: "2026-03-06", summary: "Administered polio vaccine (OPV3), next: measles booster due March 15" },
];

const RecordsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Health Records</h1>
          <p className="text-muted-foreground text-sm mt-1">Electronic health records and clinical documentation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Record
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-4 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search records..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        {records.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-lg p-6 hover:border-border/80 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-secondary rounded-md mt-0.5">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{r.id}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{r.type}</span>
                </div>
                <h3 className="text-sm font-medium text-foreground">{r.patient}</h3>
                <p className="text-sm text-muted-foreground">{r.summary}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                  <Calendar className="w-3 h-3" />
                  {r.date}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordsPage;
