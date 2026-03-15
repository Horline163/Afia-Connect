import { useState } from "react";
import { Search, Filter, UserPlus, MoreHorizontal } from "lucide-react";

const patientsData = [
  { id: "P-0001", name: "Marie Kabila", age: 34, gender: "F", phone: "+243 812 345 678", status: "Critical", condition: "Hypertension", lastVisit: "2026-03-09" },
  { id: "P-0002", name: "Joseph Mulamba", age: 28, gender: "M", phone: "+243 812 456 789", status: "Stable", condition: "Malaria Recovery", lastVisit: "2026-03-08" },
  { id: "P-0003", name: "Berthe Nyota", age: 22, gender: "F", phone: "+243 812 567 890", status: "Monitoring", condition: "Pregnancy - Week 32", lastVisit: "2026-03-09" },
  { id: "P-0004", name: "Pascal Ilunga", age: 45, gender: "M", phone: "+243 812 678 901", status: "Stable", condition: "Diabetes Type 2", lastVisit: "2026-03-07" },
  { id: "P-0005", name: "Amani Kayembe", age: 5, gender: "M", phone: "+243 812 789 012", status: "Monitoring", condition: "Immunization Schedule", lastVisit: "2026-03-06" },
  { id: "P-0006", name: "Esperance Ngoma", age: 29, gender: "F", phone: "+243 812 890 123", status: "Stable", condition: "Postnatal Care", lastVisit: "2026-03-05" },
  { id: "P-0007", name: "Claude Banza", age: 52, gender: "M", phone: "+243 812 901 234", status: "Critical", condition: "Respiratory Infection", lastVisit: "2026-03-09" },
  { id: "P-0008", name: "Jeanne Makola", age: 38, gender: "F", phone: "+243 812 012 345", status: "Stable", condition: "Follow-up Check", lastVisit: "2026-03-04" },
];

const PatientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = patientsData.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || p.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm mt-1">{patientsData.length} registered patients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-heading font-semibold text-sm rounded-md hover:opacity-90 transition-opacity">
          <UserPlus className="w-4 h-4" />
          New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-4 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {["all", "stable", "monitoring", "critical"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">ID</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Patient Name</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Age</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Gender</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Contact</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Condition</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Status</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Last Visit</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((patient) => (
                <tr key={patient.id} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{patient.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.age}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.gender}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.phone}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.condition}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        patient.status === "Critical"
                          ? "bg-destructive/10 text-destructive"
                          : patient.status === "Monitoring"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 rounded hover:bg-secondary text-muted-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;
