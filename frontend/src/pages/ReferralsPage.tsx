import { ArrowUpRight, Clock, CheckCircle, AlertTriangle, XCircle, Plus } from "lucide-react";

const referrals = [
  { id: "R-0041", patient: "Marie Kabila", from: "Nord-Kivu Health Center", to: "Goma Provincial Hospital", priority: "Urgent", reason: "Hypertensive Crisis - BP 180/110", status: "In Transit", date: "2026-03-09" },
  { id: "R-0040", patient: "Claude Banza", from: "Nord-Kivu Health Center", to: "Goma Provincial Hospital", priority: "Urgent", reason: "Severe Respiratory Infection", status: "Accepted", date: "2026-03-09" },
  { id: "R-0039", patient: "Berthe Nyota", from: "Nord-Kivu Health Center", to: "Virunga District Hospital", priority: "Normal", reason: "High-risk Pregnancy - Week 32 Check", status: "Completed", date: "2026-03-08" },
  { id: "R-0038", patient: "Amani Kayembe", from: "Nord-Kivu Health Center", to: "Goma Pediatric Clinic", priority: "Normal", reason: "Delayed Immunization Schedule", status: "Pending", date: "2026-03-07" },
  { id: "R-0037", patient: "Esperance Ngoma", from: "Nord-Kivu Health Center", to: "Virunga District Hospital", priority: "Low", reason: "Postnatal Follow-up", status: "Completed", date: "2026-03-05" },
  { id: "R-0036", patient: "Jean-Pierre Mukendi", from: "Nord-Kivu Health Center", to: "Goma Provincial Hospital", priority: "Urgent", reason: "Suspected Meningitis", status: "Rejected", date: "2026-03-04" },
];

const statusConfig: Record<string, { icon: typeof Clock; className: string }> = {
  Pending: { icon: Clock, className: "text-muted-foreground" },
  Accepted: { icon: CheckCircle, className: "text-info" },
  "In Transit": { icon: ArrowUpRight, className: "text-warning" },
  Completed: { icon: CheckCircle, className: "text-success" },
  Rejected: { icon: XCircle, className: "text-destructive" },
};

const ReferralsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage patient referrals and case escalations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: "42", sub: "This month" },
          { label: "Pending", value: "8", sub: "Awaiting response" },
          { label: "In Progress", value: "5", sub: "Currently active" },
          { label: "Completion Rate", value: "87%", sub: "Last 30 days" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Referrals list */}
      <div className="space-y-3">
        {referrals.map((ref) => {
          const StatusIcon = statusConfig[ref.status]?.icon || Clock;
          const statusClass = statusConfig[ref.status]?.className || "text-muted-foreground";
          return (
            <div key={ref.id} className="bg-card border border-border rounded-lg p-6 hover:border-border/80 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">{ref.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      ref.priority === "Urgent"
                        ? "bg-destructive/10 text-destructive"
                        : ref.priority === "Normal"
                        ? "bg-info/10 text-info"
                        : "bg-secondary text-muted-foreground"
                    }`}>
                      {ref.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-foreground">{ref.patient}</h3>
                  <p className="text-sm text-muted-foreground">{ref.reason}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ref.from}</span>
                    <ArrowUpRight className="w-3 h-3" />
                    <span>{ref.to}</span>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${statusClass}`}>
                    <StatusIcon className="w-4 h-4" />
                    {ref.status}
                  </div>
                  <p className="text-xs text-muted-foreground">{ref.date}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReferralsPage;
