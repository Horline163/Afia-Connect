import { useMemo } from "react";
import {
  Users, ClipboardCheck, Activity, AlertTriangle,
  UserPlus, Stethoscope, Video, ArrowUpRight, Clock,
  Heart, Baby, ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isSameDay, isSameMonth, subDays, subMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment, Immunization, Notification, Patient, Referral } from "@/lib/types";

type DashboardData = {
  stats?: Record<string, number>;
  recent_patients?: Patient[];
  recent_referrals?: Referral[];
  pending_referrals?: Referral[];
  upcoming_appointments?: Appointment[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="text-xs">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function parseDate(input?: string) {
  if (!input) return null;
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function patientDisplayId(patient: Patient) {
  if (patient.nationalId) return patient.nationalId;
  return patient.patientId?.slice(0, 8).toUpperCase();
}

function patientAge(patient: Patient) {
  const dob = parseDate(patient.dateOfBirth);
  if (!dob) return "—";
  const diff = Date.now() - dob.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return years.toString();
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = (user?.role ?? "").toLowerCase();
  const dashboardEndpoint =
    role === "administrator" ? "/dashboard/admin" : role === "doctor" ? "/dashboard/doctor" : "/dashboard/chw";

  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard", dashboardEndpoint],
    queryFn: () => apiData<DashboardData>(dashboardEndpoint),
    enabled: !!user,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", "dashboard"],
    queryFn: () => apiData<Patient[]>("/patients"),
    enabled: !!user,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments-upcoming"],
    queryFn: () => apiData<Appointment[]>("/appointments/upcoming"),
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", "dashboard"],
    queryFn: () => apiData<Notification[]>("/notifications"),
    enabled: !!user,
  });

  const { data: dueImmunizations = [] } = useQuery({
    queryKey: ["immunizations-due"],
    queryFn: () => apiData<Immunization[]>("/immunizations/due"),
    enabled: !!user && role !== "doctor",
  });

  const referralsEndpoint =
    role === "administrator" || role === "doctor" ? "/referrals" :
    role === "chw" || role === "nurse" ? "/referrals/my" :
    null;

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", "dashboard", referralsEndpoint],
    queryFn: () => apiData<Referral[]>(referralsEndpoint as string),
    enabled: !!user && !!referralsEndpoint,
  });

  const stats = dashboardData?.stats ?? {};
  const recentPatients = dashboardData?.recent_patients ?? patients.slice(0, 5);
  const upcomingAppointments = dashboardData?.upcoming_appointments ?? appointments.slice(0, 5);
  const alertItems = notifications.slice(0, 4);
  const referralSource = referrals.length
    ? referrals
    : dashboardData?.recent_referrals ?? dashboardData?.pending_referrals ?? [];

  const statCards = useMemo(() => {
    if (role === "administrator") {
      return [
        { label: "Total Patients", value: stats.total_patients ?? 0, icon: Users },
        { label: "Total Users", value: stats.total_users ?? 0, icon: Activity },
        { label: "Total Consultations", value: stats.total_consultations ?? 0, icon: ClipboardCheck },
        { label: "Pending Referrals", value: stats.pending_referrals ?? 0, icon: AlertTriangle },
      ];
    }
    if (role === "doctor") {
      return [
        { label: "My Consultations", value: stats.my_consultations ?? 0, icon: Video },
        { label: "Pending Requests", value: stats.pending_consultations ?? 0, icon: Clock },
        { label: "Completed", value: stats.completed_consultations ?? 0, icon: ClipboardCheck },
        { label: "High Risk Patients", value: stats.high_risk_patients ?? 0, icon: AlertTriangle },
      ];
    }
    return [
      { label: "My Patients", value: stats.my_patients ?? 0, icon: Users },
      { label: "My Referrals", value: stats.my_referrals ?? 0, icon: ArrowUpRight },
      { label: "My Consultations", value: stats.my_consultations ?? 0, icon: Video },
      { label: "Upcoming Appointments", value: upcomingAppointments.length, icon: Clock },
    ];
  }, [role, stats, upcomingAppointments.length]);

  const weeklyPatients = useMemo(() => {
    const data: { day: string; patients: number; consultations: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = subDays(new Date(), i);
      const dayLabel = format(date, "EEE");
      const patientCount = patients.filter((p) => {
        const createdAt = parseDate(p.createdAt);
        return createdAt ? isSameDay(createdAt, date) : false;
      }).length;
      const consultCount = appointments.filter((apt) => {
        const scheduled = parseDate(apt.scheduledDate);
        return scheduled ? isSameDay(scheduled, date) : false;
      }).length;
      data.push({ day: dayLabel, patients: patientCount, consultations: consultCount });
    }
    return data;
  }, [patients, appointments]);

  const monthlyTrend = useMemo(() => {
    const data: { month: string; patients: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = subMonths(new Date(), i);
      const monthLabel = format(date, "MMM");
      const count = patients.filter((p) => {
        const createdAt = parseDate(p.createdAt);
        return createdAt ? isSameMonth(createdAt, date) : false;
      }).length;
      data.push({ month: monthLabel, patients: count });
    }
    return data;
  }, [patients]);

  const referralDistribution = useMemo(() => {
    if (!referralSource.length) return [];
    const counts: Record<string, number> = {};
    referralSource.forEach((ref) => {
      const status = (ref.status || "Pending").trim();
      counts[status] = (counts[status] ?? 0) + 1;
    });
    const total = referralSource.length;
    const palette = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];
    return Object.entries(counts).map(([status, count], index) => ({
      name: status,
      count,
      percent: Math.round((count / total) * 100),
      color: palette[index % palette.length],
    }));
  }, [referralSource]);

  const highRiskCount = stats.high_risk_mch ?? stats.high_risk_patients ?? 0;
  const dueImmunizationsCount = stats.due_immunizations ?? dueImmunizations.length;
  const chartAnimation = { isAnimationActive: false as const };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ""} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-md px-3 py-2">
          <Heart className="w-3.5 h-3.5 text-primary" />
          {user?.facility?.name ?? "Health Facility"}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className="p-2 bg-secondary rounded-md flex-shrink-0">
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Register Patient", icon: UserPlus, to: "/patients", color: "text-primary bg-primary/10" },
            { label: "Record Vitals", icon: Stethoscope, to: "/records", color: "text-info bg-info/10" },
            { label: "Start Consultation", icon: Video, to: "/consultations", color: "text-success bg-success/10" },
            { label: "New Referral", icon: ArrowUpRight, to: "/referrals", color: "text-warning bg-warning/10" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all hover:shadow-md text-left group"
            >
              <div className={`p-2 rounded-md ${action.color}`}>
                <action.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block truncate">{action.label}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Activity</CardTitle>
            <p className="text-xs text-muted-foreground">New patients and scheduled appointments</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visits">
              <TabsList className="mb-4">
                <TabsTrigger value="visits">Daily Overview</TabsTrigger>
                <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
              </TabsList>
              <TabsContent value="visits">
                <ResponsiveContainer width="100%" height={200} debounce={50}>
                  <BarChart data={weeklyPatients} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="patients" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Patients" {...chartAnimation} />
                    <Bar dataKey="consultations" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} name="Appointments" {...chartAnimation} />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="trend">
                <ResponsiveContainer width="100%" height={200} debounce={50}>
                  <AreaChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="patients" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorPatients)" name="Patients" {...chartAnimation} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Referral distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Referral Status</CardTitle>
            <p className="text-xs text-muted-foreground">Recent referral distribution</p>
          </CardHeader>
          <CardContent>
            {referralDistribution.length === 0 ? (
              <div className="text-xs text-muted-foreground py-10 text-center">No referral data available</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160} debounce={50}>
                  <PieChart>
                    <Pie data={referralDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count" {...chartAnimation}>
                      {referralDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {referralDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium text-foreground">{item.count} · {item.percent}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alerts & Notifications</CardTitle>
              <button onClick={() => navigate("/notifications")} className="text-xs text-primary hover:underline font-medium">
                View all
              </button>
            </div>
          </CardHeader>
          <div className="divide-y divide-border mt-4">
            {alertItems.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No new alerts.</div>
            ) : (
              alertItems.map((alert) => {
                const type = (alert.type ?? "info").toLowerCase();
                return (
                  <div key={alert.notificationId} className="flex items-start gap-3 p-4">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        type === "urgent" ? "bg-destructive animate-pulse" :
                        type === "warning" ? "bg-warning" : "bg-info"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{alert.message || alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : "—"}
                      </p>
                    </div>
                    <Badge variant={type === "urgent" ? "destructive" : type === "warning" ? "warning" : "info"} className="flex-shrink-0 text-[10px]">
                      {type}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's Schedule</CardTitle>
              <span className="text-xs text-muted-foreground">{upcomingAppointments.length} visits</span>
            </div>
          </CardHeader>
          <div className="divide-y divide-border mt-4">
            {upcomingAppointments.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">No upcoming appointments.</div>
            ) : (
              upcomingAppointments.map((apt) => (
                <div key={apt.appointmentId} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{`${apt.patient.firstName} ${apt.patient.lastName}`}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {apt.scheduledDate ? format(new Date(apt.scheduledDate), "MMM d") : "—"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{apt.appointmentType || "Visit"}</p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      apt.status === "Completed" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                    }`}>
                      {apt.status || "Scheduled"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Patients</CardTitle>
            <button onClick={() => navigate("/patients")} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Name", "Age", "Gender", "Phone", "Health Area"].map((h) => (
                    <th key={h} className="text-left text-xs font-heading font-medium text-muted-foreground px-6 py-3 first:pl-6">{h}</th>
                  ))}
                  <th className="px-6 py-3">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-sm text-muted-foreground">No patients available.</td>
                  </tr>
                ) : (
                  recentPatients.map((patient) => (
                    <tr
                      key={patient.patientId}
                      className="hover:bg-secondary/40 transition-colors cursor-pointer"
                      onClick={() => navigate("/patients")}
                    >
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{patientDisplayId(patient)}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{patient.firstName} {patient.lastName}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{patientAge(patient)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{patient.gender ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{patient.phoneNumber ?? "—"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{patient.healthArea ?? patient.village ?? "—"}</td>
                      <td className="px-6 py-4">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Maternal & Child summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/maternal-health")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">{highRiskCount}</p>
                <p className="text-sm text-muted-foreground">High Risk Pregnancies</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Flagged for follow-up</span>
              <span className="text-primary flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/maternal-health")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-info/10 rounded-lg">
                <Baby className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">{dueImmunizationsCount}</p>
                <p className="text-sm text-muted-foreground">Immunizations Due</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Due within 7 days</span>
              <span className="text-primary flex items-center gap-1">View <ArrowRight className="w-3 h-3" /></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
