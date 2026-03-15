import { Heart, Baby, Calendar, AlertTriangle, TrendingUp } from "lucide-react";

const pregnancies = [
  { name: "Berthe Nyota", age: 22, week: 32, risk: "High", nextVisit: "2026-03-12", notes: "Previous cesarean, monitoring closely" },
  { name: "Esperance Ngoma", age: 29, week: 6, risk: "Low", nextVisit: "2026-03-20", notes: "Postnatal care - healthy delivery" },
  { name: "Grace Mbaki", age: 35, week: 28, risk: "Medium", notes: "Gestational diabetes screening due", nextVisit: "2026-03-14" },
];

const immunizations = [
  { child: "Amani Kayembe", age: "5 years", vaccine: "Measles Booster", dueDate: "2026-03-15", status: "Due" },
  { child: "Blessing Ilunga", age: "9 months", vaccine: "Yellow Fever", dueDate: "2026-03-10", status: "Overdue" },
  { child: "David Mulamba", age: "6 weeks", vaccine: "DPT-1", dueDate: "2026-03-18", status: "Scheduled" },
];

const MaternalHealthPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Maternal & Child Health</h1>
        <p className="text-muted-foreground text-sm mt-1">Track antenatal care, immunizations, and child growth</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Pregnancies", value: "12", icon: Heart },
          { label: "Children Under 5", value: "34", icon: Baby },
          { label: "This Week's Visits", value: "8", icon: Calendar },
          { label: "High Risk Cases", value: "3", icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-md">
                <s.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pregnancies */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Antenatal Care
            </h2>
          </div>
          <div className="divide-y divide-border">
            {pregnancies.map((p, i) => (
              <div key={i} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{p.name}, {p.age}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.risk === "High" ? "bg-destructive/10 text-destructive" :
                    p.risk === "Medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                  }`}>{p.risk} Risk</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Week {p.week}</span>
                  <span>Next: {p.nextVisit}</span>
                </div>
                <p className="text-xs text-muted-foreground">{p.notes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Immunizations */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Immunization Schedule
            </h2>
          </div>
          <div className="divide-y divide-border">
            {immunizations.map((im, i) => (
              <div key={i} className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{im.child}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    im.status === "Overdue" ? "bg-destructive/10 text-destructive" :
                    im.status === "Due" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                  }`}>{im.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{im.age}</span>
                  <span>{im.vaccine}</span>
                  <span>Due: {im.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaternalHealthPage;
