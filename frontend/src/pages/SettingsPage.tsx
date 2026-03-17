import { useEffect, useState } from "react";
import {
  User, Bell, Shield, Globe, Smartphone, Moon,
  Save, Eye, EyeOff, Key, LogOut, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    facility: "",
    zone: "",
    employeeId: "",
  });

  useEffect(() => {
    if (!user) return;
    setProfile((prev) => ({
      ...prev,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phoneNumber ?? "",
      role: user.role ?? "",
      facility: user.facility?.name ?? "",
      zone: [user.facility?.district, user.facility?.province].filter(Boolean).join(", "),
    }));
  }, [user]);

  const [notifications, setNotifications] = useState({
    urgentAlerts: true,
    referralUpdates: true,
    consultationReminders: true,
    immunizationDue: true,
    systemUpdates: false,
    smsAlerts: true,
    emailReports: false,
  });

  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    sessionTimeout: "60",
    dataSharing: true,
    auditLog: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");

  function saveProfile() {
    toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
  }

  function changePassword() {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({ title: "Please fill all password fields", variant: "destructive" });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast({ title: "New passwords don't match", variant: "destructive" });
      return;
    }
    setPasswords({ current: "", new: "", confirm: "" });
    toast({ title: "Password changed", description: "Your password has been updated." });
  }

  function saveNotifications() {
    toast({ title: "Notification preferences saved" });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, preferences, and security</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" />Notifications</TabsTrigger>
          <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
          <TabsTrigger value="preferences"><Globe className="w-4 h-4 mr-2" />Preferences</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl font-heading font-bold bg-primary/10 text-primary">TH</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">{profile.firstName} {profile.lastName}</h2>
              <p className="text-sm text-muted-foreground">{profile.role} · {profile.facility}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success" className="text-xs">Active</Badge>
                <Badge variant="secondary" className="text-xs">{profile.employeeId}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={profile.firstName} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={profile.lastName} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          <Separator />

          {/* Work Info */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Work Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={profile.role} onValueChange={(v) => setProfile(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHW">Community Health Worker</SelectItem>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Facility</Label>
                <Input value={profile.facility} onChange={(e) => setProfile(p => ({ ...p, facility: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Zone / Location</Label>
              <Input value={profile.zone} onChange={(e) => setProfile(p => ({ ...p, zone: e.target.value }))} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile}><Save className="w-4 h-4" />Save Profile</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Alert Preferences</h3>
            {[
              { key: "urgentAlerts", label: "Urgent patient alerts", desc: "Critical status changes and emergency notifications" },
              { key: "referralUpdates", label: "Referral status updates", desc: "When referrals are accepted, completed, or rejected" },
              { key: "consultationReminders", label: "Consultation reminders", desc: "Upcoming and scheduled teleconsultation notifications" },
              { key: "immunizationDue", label: "Immunization reminders", desc: "Alerts when vaccinations are due or overdue" },
              { key: "systemUpdates", label: "System updates", desc: "Platform updates and maintenance notifications" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications] as boolean}
                  onCheckedChange={(v) => setNotifications(n => ({ ...n, [item.key]: v }))}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground">Delivery Channels</h3>
            {[
              { key: "smsAlerts", label: "SMS Alerts", desc: "Receive urgent alerts via SMS (+243 812 999 001)" },
              { key: "emailReports", label: "Email Reports", desc: "Weekly summary reports to tania.horline@nordkivu-health.cd" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key as keyof typeof notifications] as boolean}
                  onCheckedChange={(v) => setNotifications(n => ({ ...n, [item.key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={saveNotifications}><Save className="w-4 h-4" />Save Preferences</Button>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Change password */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />Change Password
            </h3>
            <div className="space-y-3">
              {[
                { key: "current", label: "Current Password" },
                { key: "new", label: "New Password" },
                { key: "confirm", label: "Confirm New Password" },
              ].map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label>{f.label}</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwords[f.key as keyof typeof passwords]}
                      onChange={(e) => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder="••••••••"
                    />
                    {f.key === "current" && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={changePassword} variant="outline">
              <Key className="w-4 h-4" />Update Password
            </Button>
          </div>

          <Separator />

          {/* Security settings */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />Security Settings
            </h3>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security with OTP via SMS</p>
              </div>
              <Switch
                checked={privacy.twoFactor}
                onCheckedChange={(v) => setPrivacy(p => ({ ...p, twoFactor: v }))}
              />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Data Sharing</p>
                <p className="text-xs text-muted-foreground">Share anonymized data with provincial health office</p>
              </div>
              <Switch
                checked={privacy.dataSharing}
                onCheckedChange={(v) => setPrivacy(p => ({ ...p, dataSharing: v }))}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Audit Log</p>
                <p className="text-xs text-muted-foreground">Log all actions performed in your account</p>
              </div>
              <Switch
                checked={privacy.auditLog}
                onCheckedChange={(v) => setPrivacy(p => ({ ...p, auditLog: v }))}
              />
            </div>
          </div>

          <Separator />

          {/* Session */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" />Active Sessions
            </h3>
            <div className="space-y-3">
              {[
                { device: "Current — Chrome / macOS", location: "Goma, DRC", time: "Active now", current: true },
                { device: "Mobile — Safari / iPhone", location: "Goma, DRC", time: "2 hours ago", current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{session.device}</p>
                      <p className="text-xs text-muted-foreground">{session.location} · {session.time}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <Badge variant="success" className="text-xs">Current</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="w-4 h-4" />Sign Out of All Devices
            </Button>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4" />Language & Region
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                    <SelectItem value="ln">Lingala</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="iso">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                    <SelectItem value="eu">DD/MM/YYYY</SelectItem>
                    <SelectItem value="us">MM/DD/YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="africa_kinshasa">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="africa_kinshasa">Africa/Kinshasa (UTC+2)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Moon className="w-4 h-4" />Appearance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "dark", label: "Dark", desc: "Dark theme (current)" },
                { value: "light", label: "Light", desc: "Light theme" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`p-4 rounded-lg border text-left transition-colors ${theme === t.value ? "border-primary bg-primary/5" : "border-border bg-card hover:border-border/80"}`}
                >
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />About
            </h3>
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              {[
                ["Application", "Afia-Connect"],
                ["Version", "1.0.0 — March 2026"],
                ["Platform", "Telemedicine · Nord-Kivu DRC"],
                ["Institution", "Adventist University of Central Africa"],
                ["Developer", "INEZA Tania Horline"],
                ["Supervisor", "Final Year Project · 2026"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => toast({ title: "Preferences saved" })}>
              <Save className="w-4 h-4" />Save Preferences
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
