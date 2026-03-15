import {
  Users,
  ClipboardCheck,
  Activity,
  AlertTriangle,
  UserPlus,
  Stethoscope,
  Video,
  ArrowUpRight,
  Clock,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Active Patients", value: "147", icon: Users, change: "+12 this week" },
  { label: "Visits Today", value: "23", icon: ClipboardCheck, change: "5 remaining" },
  { label: "Pending Referrals", value: "8", icon: Activity, change: "3 urgent" },
  { label: "Monitoring Alerts", value: "5", icon: AlertTriangle, change: "2 critical" },
];

const quickActions = [
  { label: "Register Patient", icon: UserPlus, to: "/patients/new", color: "primary" },
  { label: "Record Vitals", icon: Stethoscope, to: "/records", color: "info" },
  { label: "Start Consultation", icon: Video, to: "/consultations", color: "success" },
  { label: "New Referral", icon: ArrowUpRight, to: "/referrals", color: "warning" },
];

const alerts = [
  { type: "urgent", message: "Patient Marie K. — Blood pressure critically high (180/110)", time: "10 min ago" },
  { type: "warning", message: "3 patients overdue for immunization follow-up", time: "1 hour ago" },
  { type: "info", message: "Dr. Mugabo accepted teleconsultation request for Patient #0042", time: "2 hours ago" },
  { type: "info", message: "Referral feedback received from Goma Provincial Hospital", time: "3 hours ago" },
];

const appointments = [
  { patient: "Amani K.", type: "Antenatal Visit", time: "10:00 AM", status: "upcoming" },
  { patient: "Jean-Pierre M.", type: "BP Monitoring", time: "11:30 AM", status: "upcoming" },
  { patient: "Esperance N.", type: "Immunization", time: "2:00 PM", status: "upcoming" },
  { patient: "Claude B.", type: "Follow-up", time: "3:30 PM", status: "upcoming" },
];

const recentPatients = [
  { name: "Marie Kabila", age: 34, gender: "F", status: "Critical", condition: "Hypertension" },
  { name: "Joseph Mulamba", age: 28, gender: "M", status: "Stable", condition: "Malaria Recovery" },
  { name: "Berthe Nyota", age: 22, gender: "F", status: "Monitoring", condition: "Pregnancy - Week 32" },
  { name: "Pascal Ilunga", age: 45, gender: "M", status: "Stable", condition: "Diabetes Type 2" },
];

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back, Tania · Nord-Kivu Health Center
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-heading font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{stat.change}</p>
              </div>
              <div className="p-2 bg-secondary rounded-md">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className={`flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors text-left group`}
            >
              <div className="p-2 bg-secondary rounded-md group-hover:bg-primary/10 transition-colors">
                <action.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground">Alerts & Notifications</h2>
          </div>
          <div className="divide-y divide-border">
            {alerts.map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-4 px-6">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    alert.type === "urgent"
                      ? "bg-destructive animate-pulse-lime"
                      : alert.type === "warning"
                      ? "bg-warning"
                      : "bg-info"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-foreground">Today's Schedule</h2>
          </div>
          <div className="divide-y divide-border">
            {appointments.map((apt, i) => (
              <div key={i} className="p-4 px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{apt.patient}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {apt.time}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{apt.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Patients</h2>
          <button
            onClick={() => navigate("/patients")}
            className="text-sm text-primary hover:underline font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Name</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Age</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Gender</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Condition</th>
                <th className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentPatients.map((patient, i) => (
                <tr key={i} className="hover:bg-secondary/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{patient.name}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.age}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{patient.gender}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
