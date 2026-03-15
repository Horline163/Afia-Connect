import { Video, Clock, Phone, MessageSquare } from "lucide-react";

const consultations = [
  { id: "C-0012", patient: "Marie Kabila", doctor: "Dr. Mugabo", type: "Video", status: "Scheduled", time: "Today, 2:00 PM", reason: "Hypertension follow-up" },
  { id: "C-0011", patient: "Claude Banza", doctor: "Dr. Amani", type: "Audio", status: "Completed", time: "Today, 9:30 AM", reason: "Respiratory assessment" },
  { id: "C-0010", patient: "Berthe Nyota", doctor: "Dr. Esperance", type: "Chat", status: "Completed", time: "Yesterday, 3:00 PM", reason: "Pregnancy consultation" },
];

const ConsultationsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Teleconsultations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage remote consultations with hospital doctors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
          <Video className="w-4 h-4" />
          Request Consultation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Today's Consultations", value: "3", icon: Video },
          { label: "Pending Requests", value: "2", icon: Clock },
          { label: "This Month", value: "28", icon: Phone },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <div className="p-2 bg-secondary rounded-md">
              <s.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {consultations.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-6 hover:border-border/80 transition-colors">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground font-mono">{c.id}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {c.type === "Video" ? <Video className="w-3 h-3" /> : c.type === "Audio" ? <Phone className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {c.type}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-foreground">{c.patient}</h3>
                <p className="text-sm text-muted-foreground">{c.reason}</p>
                <p className="text-xs text-muted-foreground">{c.doctor}</p>
              </div>
              <div className="text-right space-y-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  c.status === "Scheduled" ? "bg-info/10 text-info" : "bg-success/10 text-success"
                }`}>
                  {c.status}
                </span>
                <p className="text-xs text-muted-foreground">{c.time}</p>
              </div>
            </div>
            {c.status === "Scheduled" && (
              <div className="mt-4 pt-4 border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-heading font-medium rounded-md hover:opacity-90 transition-opacity">
                  <Video className="w-4 h-4" />
                  Join Consultation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsultationsPage;