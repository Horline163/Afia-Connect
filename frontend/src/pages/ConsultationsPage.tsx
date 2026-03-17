import { useMemo, useState } from "react";
import {
  Video, Clock, Phone, MessageSquare, Search,
  CheckCircle, Calendar, Stethoscope, MoreHorizontal, Eye,
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Consultation, Patient, User } from "@/lib/types";

const consultationSchema = z.object({
  patientId: z.string().min(1, "Patient required"),
  doctorId: z.string().min(1, "Doctor required"),
  consultationType: z.string().min(1, "Consultation type required"),
  scheduledTime: z.string().min(1, "Time required"),
  consultationNotes: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

function statusBadge(status?: string) {
  const value = (status ?? "Requested").toLowerCase();
  if (value === "scheduled") return "info";
  if (value === "in progress") return "warning";
  if (value === "completed") return "success";
  if (value === "cancelled") return "destructive";
  return "secondary";
}

function typeIcon(type?: string) {
  const value = (type ?? "").toLowerCase();
  if (value === "audio") return Phone;
  if (value === "chat") return MessageSquare;
  return Video;
}

export default function ConsultationsPage() {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewConsultation, setViewConsultation] = useState<Consultation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const role = (user?.role ?? "").toLowerCase();
  const listEndpoint =
    role === "doctor" ? "/consultations/my" :
    role === "chw" || role === "nurse" ? "/consultations/initiated" :
    null;
  const canRequest = role === "chw" || role === "nurse";
  const canUpdateStatus = role === "doctor";

  const { data: consultations = [] } = useQuery({
    queryKey: ["consultations", listEndpoint],
    queryFn: () => apiData<Consultation[]>(listEndpoint as string),
    enabled: !!user && !!listEndpoint,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", "consultations"],
    queryFn: () => apiData<Patient[]>("/patients"),
    enabled: canRequest,
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["users", "doctors"],
    queryFn: () => apiData<User[]>("/users?role=Doctor"),
    enabled: canRequest,
  });

  const createConsultation = useMutation({
    mutationFn: (data: ConsultationFormData) =>
      apiData<Consultation>("/consultations", {
        method: "POST",
        body: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          consultationType: data.consultationType,
          scheduledTime: data.scheduledTime.length === 16 ? `${data.scheduledTime}:00` : data.scheduledTime,
          consultationNotes: data.consultationNotes,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      setShowNewDialog(false);
      form.reset();
      toast({ title: "Consultation requested", description: "Awaiting doctor confirmation." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to request consultation", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiData<Consultation>(`/consultations/${id}/status`, {
        method: "PATCH",
        body: { status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      toast({ title: "Consultation updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update consultation", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      consultationType: "Video",
      scheduledTime: "",
      consultationNotes: "",
    },
  });

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return consultations.filter((c) => {
      const patientName = `${c.patient?.firstName ?? ""} ${c.patient?.lastName ?? ""}`.toLowerCase();
      const doctorName = `${c.doctor?.firstName ?? ""} ${c.doctor?.lastName ?? ""}`.toLowerCase();
      return (
        patientName.includes(query) ||
        doctorName.includes(query) ||
        (c.consultationNotes ?? "").toLowerCase().includes(query)
      );
    });
  }, [consultations, searchQuery]);

  const scheduled = filtered.filter((c) => !["completed", "cancelled"].includes((c.status ?? "").toLowerCase()));
  const completed = filtered.filter((c) => ["completed", "cancelled"].includes((c.status ?? "").toLowerCase()));

  function onSubmit(data: ConsultationFormData) {
    createConsultation.mutate(data);
  }

  function joinConsultation() {
    toast({ title: "Joining consultation...", description: "Connecting to secure session." });
  }

  const ConsultationCard = ({ c }: { c: Consultation }) => {
    const TypeIcon = typeIcon(c.consultationType);
    const scheduledTime = c.scheduledTime ? format(new Date(c.scheduledTime), "PPpp") : "—";
    return (
      <div className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-md flex-shrink-0 ${c.status === "In Progress" ? "bg-warning/10" : "bg-secondary"}`}>
            <TypeIcon className={`w-4 h-4 ${c.status === "In Progress" ? "text-warning" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">{c.consultationId?.slice(0, 8)}</span>
                <Badge variant={statusBadge(c.status) as any} className="text-[10px]">{c.status ?? "Requested"}</Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewConsultation(c)}>
                    <Eye className="mr-2 h-4 w-4" />View Details
                  </DropdownMenuItem>
                  {canUpdateStatus && (c.status ?? "").toLowerCase() !== "completed" && (
                    <DropdownMenuItem onClick={() => updateStatus.mutate({ id: c.consultationId, status: "Completed" })}>
                      <CheckCircle className="mr-2 h-4 w-4" />Mark Complete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{c.patient?.firstName} {c.patient?.lastName}</p>
              {c.consultationNotes && <p className="text-xs text-muted-foreground mt-0.5">{c.consultationNotes}</p>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" />{c.doctor?.firstName} {c.doctor?.lastName}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{scheduledTime}</span>
              <span className="flex items-center gap-1"><TypeIcon className="w-3 h-3" />{c.consultationType ?? "Video"}</span>
            </div>
            {(c.status ?? "").toLowerCase() === "scheduled" && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" onClick={joinConsultation} className="gap-2">
                  <Video className="w-3.5 h-3.5" />
                  Join Consultation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Teleconsultations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage remote consultations with hospital doctors</p>
        </div>
        {canRequest && (
          <Button onClick={() => setShowNewDialog(true)}>
            <Video className="w-4 h-4" />
            Request Consultation
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active / In Progress", value: consultations.filter(c => (c.status ?? "").toLowerCase() === "in progress").length.toString(), icon: Video, color: "text-warning" },
          { label: "Scheduled", value: consultations.filter(c => (c.status ?? "").toLowerCase() === "scheduled").length.toString(), icon: Calendar, color: "text-info" },
          { label: "Pending Requests", value: consultations.filter(c => (c.status ?? "").toLowerCase() === "requested").length.toString(), icon: Clock, color: "text-muted-foreground" },
          { label: "Completed", value: consultations.filter(c => (c.status ?? "").toLowerCase() === "completed").length.toString(), icon: CheckCircle, color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
            <div className="p-2 bg-secondary rounded-md flex-shrink-0">
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by patient or doctor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
        />
      </div>

      {/* List */}
      <Tabs defaultValue="scheduled">
        <TabsList>
          <TabsTrigger value="scheduled">Active & Scheduled ({scheduled.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="scheduled" className="space-y-3 mt-4">
          {scheduled.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No active consultations.</div>
          ) : (
            scheduled.map((c) => <ConsultationCard key={c.consultationId} c={c} />)
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No completed consultations.</div>
          ) : (
            completed.map((c) => <ConsultationCard key={c.consultationId} c={c} />)
          )}
        </TabsContent>
      </Tabs>

      {/* New Consultation Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Consultation</DialogTitle>
            <DialogDescription>Schedule a new teleconsultation with a doctor.</DialogDescription>
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
              <FormField control={form.control} name="doctorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Doctor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.userId} value={d.userId}>
                          {d.firstName} {d.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="consultationType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Audio">Audio</SelectItem>
                        <SelectItem value="Chat">Chat</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="scheduledTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Time</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="consultationNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Reason for consultation..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createConsultation.isPending}>Submit Request</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Consultation Dialog */}
      <Dialog open={!!viewConsultation} onOpenChange={(open) => !open && setViewConsultation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
          </DialogHeader>
          {viewConsultation && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-heading font-bold text-primary">
                    {viewConsultation.patient?.firstName?.[0] ?? "P"}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">
                    {viewConsultation.patient?.firstName} {viewConsultation.patient?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{viewConsultation.consultationId?.slice(0, 8)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Doctor", value: `${viewConsultation.doctor?.firstName ?? ""} ${viewConsultation.doctor?.lastName ?? ""}`.trim() || "—" },
                  { label: "Type", value: viewConsultation.consultationType ?? "—" },
                  { label: "Status", value: viewConsultation.status ?? "Requested" },
                  { label: "Scheduled", value: viewConsultation.scheduledTime ? format(new Date(viewConsultation.scheduledTime), "PPpp") : "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewConsultation.consultationNotes && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{viewConsultation.consultationNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewConsultation(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
