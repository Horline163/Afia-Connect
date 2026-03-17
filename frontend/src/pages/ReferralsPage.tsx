import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, Clock, CheckCircle, XCircle,
  Plus, X, Search, Filter, MoreHorizontal, Eye, MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { HealthFacility, Patient, Referral } from "@/lib/types";

const referralSchema = z.object({
  patientId: z.string().min(1, "Patient required"),
  fromFacilityId: z.string().min(1, "Origin facility required"),
  toFacilityId: z.string().min(1, "Destination facility required"),
  priority: z.string().min(1, "Priority required"),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  feedbackNotes: z.string().optional(),
});

type ReferralFormData = z.infer<typeof referralSchema>;

const statusConfig: Record<string, { icon: typeof Clock; color: string; badge: any }> = {
  Pending: { icon: Clock, color: "text-muted-foreground", badge: "secondary" },
  Accepted: { icon: CheckCircle, color: "text-info", badge: "info" },
  "In Transit": { icon: ArrowUpRight, color: "text-warning", badge: "warning" },
  Completed: { icon: CheckCircle, color: "text-success", badge: "success" },
  Rejected: { icon: XCircle, color: "text-destructive", badge: "destructive" },
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}

export default function ReferralsPage() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewReferral, setViewReferral] = useState<Referral | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const role = (user?.role ?? "").toLowerCase();
  const listEndpoint =
    role === "administrator" || role === "doctor" ? "/referrals" :
    role === "chw" || role === "nurse" ? "/referrals/my" :
    null;

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", listEndpoint],
    queryFn: () => apiData<Referral[]>(listEndpoint as string),
    enabled: !!user && !!listEndpoint,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", "referrals"],
    queryFn: () => apiData<Patient[]>("/patients"),
    enabled: role === "chw" || role === "nurse",
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => apiData<HealthFacility[]>("/facilities"),
    enabled: role === "chw" || role === "nurse",
  });

  const createReferral = useMutation({
    mutationFn: (data: ReferralFormData) =>
      apiData<Referral>("/referrals", {
        method: "POST",
        body: {
          patientId: data.patientId,
          fromFacilityId: data.fromFacilityId,
          toFacilityId: data.toFacilityId,
          priority: data.priority,
          reason: data.reason,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      setShowNewDialog(false);
      form.reset();
      toast({ title: "Referral submitted", description: "Referral created successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create referral", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, feedbackNotes }: { id: string; status: string; feedbackNotes?: string }) =>
      apiData<Referral>(`/referrals/${id}/status`, {
        method: "PATCH",
        body: { status, feedbackNotes },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
      toast({ title: "Referral updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update referral", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    defaultValues: {
      patientId: "",
      fromFacilityId: user?.facility?.facilityId ?? "",
      toFacilityId: "",
      priority: "Normal",
      reason: "",
      feedbackNotes: "",
    },
  });

  useEffect(() => {
    if (!user?.facility?.facilityId) return;
    if (!form.getValues("fromFacilityId")) {
      form.setValue("fromFacilityId", user.facility.facilityId, { shouldValidate: true });
    }
  }, [user?.facility?.facilityId, form]);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return referrals.filter((r) => {
      const patientName = `${r.patient?.firstName ?? ""} ${r.patient?.lastName ?? ""}`.toLowerCase();
      const matchesSearch =
        patientName.includes(query) ||
        (r.referralId?.toLowerCase().includes(query) ?? false) ||
        (r.reason?.toLowerCase().includes(query) ?? false);
      const matchesStatus = statusFilter === "all" || (r.status ?? "").toLowerCase().replace(" ", "-") === statusFilter;
      const matchesPriority = priorityFilter === "all" || (r.priority ?? "").toLowerCase() === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [referrals, searchQuery, statusFilter, priorityFilter]);

  const counts = useMemo(() => ({
    total: referrals.length,
    pending: referrals.filter(r => r.status === "Pending").length,
    inTransit: referrals.filter(r => r.status === "In Transit").length,
    completed: referrals.filter(r => r.status === "Completed").length,
    urgent: referrals.filter(r => r.priority === "Urgent").length,
  }), [referrals]);

  function onSubmit(data: ReferralFormData) {
    createReferral.mutate(data);
  }

  const canRequest = role === "chw" || role === "nurse";
  const canUpdate = role === "doctor" || role === "administrator";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Referrals</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage patient referrals and case escalations</p>
        </div>
        {canRequest && (
          <Button onClick={() => setShowNewDialog(true)}>
            <Plus className="w-4 h-4" />
            New Referral
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total", value: counts.total, color: "" },
          { label: "Pending", value: counts.pending, color: "text-muted-foreground" },
          { label: "In Transit", value: counts.inTransit, color: "text-warning" },
          { label: "Completed", value: counts.completed, color: "text-success" },
          { label: "Urgent", value: counts.urgent, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 text-center">
            <p className={`text-2xl font-heading font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search referrals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {searchQuery && <button onClick={() => setSearchQuery("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {["all", "pending", "accepted", "in-transit", "completed", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${statusFilter === s ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "urgent", "normal", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${priorityFilter === p ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No referrals match your filters.</div>
        ) : (
          filtered.map((ref) => {
            const StatusIcon = statusConfig[ref.status ?? "Pending"]?.icon || Clock;
            const badgeVariant = statusConfig[ref.status ?? "Pending"]?.badge || "secondary";
            return (
              <div key={ref.referralId} className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors cursor-pointer" onClick={() => setViewReferral(ref)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{ref.referralId?.slice(0, 8)}</span>
                      <Badge variant={ref.priority === "Urgent" ? "destructive" : ref.priority === "Normal" ? "info" : "secondary"} className="text-[10px]">
                        {ref.priority ?? "Normal"}
                      </Badge>
                      <Badge variant={badgeVariant} className="text-[10px]">
                        <StatusIcon className="w-2.5 h-2.5 mr-1" />
                        {ref.status ?? "Pending"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{ref.patient?.firstName} {ref.patient?.lastName}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{ref.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{ref.fromFacility?.name ?? "—"}</span>
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="font-medium text-foreground">{ref.toFacility?.name ?? "—"}</span>
                    </div>
                    {ref.feedbackNotes && (
                      <div className="bg-secondary/50 rounded-md p-2.5 mt-1">
                        <p className="text-xs text-muted-foreground">{ref.feedbackNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(ref.createdAt)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewReferral(ref); }}>
                          <Eye className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        {canUpdate && ref.status === "Pending" && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: ref.referralId, status: "In Transit" }); }}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />Mark In Transit
                          </DropdownMenuItem>
                        )}
                        {canUpdate && (ref.status === "Accepted" || ref.status === "In Transit") && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: ref.referralId, status: "Completed" }); }}>
                            <CheckCircle className="mr-2 h-4 w-4" />Mark Completed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Referral Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Referral</DialogTitle>
            <DialogDescription>Send patient details to a higher-level facility.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.patientId} value={p.patientId}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="fromFacilityId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Facility</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {facilities.map((f) => (
                          <SelectItem key={f.facilityId} value={f.facilityId}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="toFacilityId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Facility</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {facilities.map((f) => (
                          <SelectItem key={f.facilityId} value={f.facilityId}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Urgent">Urgent</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Clinical reason for referral..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createReferral.isPending}>Submit Referral</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Referral Dialog */}
      <Dialog open={!!viewReferral} onOpenChange={(open) => !open && setViewReferral(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Referral Details</DialogTitle>
          </DialogHeader>
          {viewReferral && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-md">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{viewReferral.patient?.firstName} {viewReferral.patient?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{viewReferral.referralId?.slice(0, 8)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Status", value: viewReferral.status ?? "Pending" },
                  { label: "Priority", value: viewReferral.priority ?? "Normal" },
                  { label: "From", value: viewReferral.fromFacility?.name ?? "—" },
                  { label: "To", value: viewReferral.toFacility?.name ?? "—" },
                  { label: "Created", value: formatDate(viewReferral.createdAt) },
                  { label: "Completed", value: formatDate(viewReferral.completedAt) },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewReferral.reason && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Reason</p>
                  <p className="text-sm text-foreground">{viewReferral.reason}</p>
                </div>
              )}
              {viewReferral.feedbackNotes && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Feedback</p>
                  <p className="text-sm text-foreground">{viewReferral.feedbackNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewReferral(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
