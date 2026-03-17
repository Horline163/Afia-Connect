import { useEffect, useMemo, useState } from "react";
import {
  Heart, Baby, Calendar, AlertTriangle, Plus, TrendingUp,
  MoreHorizontal, Eye, User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isBefore, isWithinInterval, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { HealthFacility, Immunization, MchRecord, Patient } from "@/lib/types";

const ancSchema = z.object({
  patientId: z.string().min(1, "Patient required"),
  recordType: z.string().min(1, "Record type required"),
  gestationalAgeWeeks: z.string().min(1, "Gestational age required"),
  visitNumber: z.string().optional(),
  fundalHeight: z.string().optional(),
  fetalHeartRate: z.string().optional(),
  muac: z.string().optional(),
  highRiskFlag: z.string().optional(),
  riskFactors: z.string().optional(),
});

const immunizationSchema = z.object({
  patientId: z.string().min(1, "Patient required"),
  vaccineName: z.string().min(1, "Vaccine required"),
  doseNumber: z.string().optional(),
  nextDueDate: z.string().optional(),
  facilityId: z.string().optional(),
});

type AncFormData = z.infer<typeof ancSchema>;
type ImmunizationFormData = z.infer<typeof immunizationSchema>;

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}

function immunizationStatus(dueDate?: string) {
  if (!dueDate) return "Scheduled";
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return "Scheduled";
  const now = new Date();
  if (isBefore(date, now)) return "Overdue";
  if (isWithinInterval(date, { start: now, end: addDays(now, 7) })) return "Due";
  return "Scheduled";
}

export default function MaternalHealthPage() {
  const [showAncDialog, setShowAncDialog] = useState(false);
  const [showImmDialog, setShowImmDialog] = useState(false);
  const [viewAnc, setViewAnc] = useState<MchRecord | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = (user?.role ?? "").toLowerCase();
  const canCreate = role === "chw" || role === "nurse";

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", "mch"],
    queryFn: () => apiData<Patient[]>("/patients"),
  });

  useEffect(() => {
    if (!selectedPatientId && patients.length) {
      setSelectedPatientId(patients[0].patientId);
    }
  }, [patients, selectedPatientId]);

  const { data: mchRecords = [] } = useQuery({
    queryKey: ["mch-records", selectedPatientId],
    queryFn: () => apiData<MchRecord[]>(`/mch/patient/${selectedPatientId}`),
    enabled: !!selectedPatientId,
  });

  const { data: highRiskRecords = [] } = useQuery({
    queryKey: ["mch-high-risk"],
    queryFn: () => apiData<MchRecord[]>("/mch/high-risk"),
    enabled: role === "doctor" || role === "administrator",
  });

  const { data: immunizationsDue = [] } = useQuery({
    queryKey: ["immunizations-due"],
    queryFn: () => apiData<Immunization[]>("/immunizations/due"),
    enabled: role !== "doctor",
  });

  const { data: facilities = [] } = useQuery({
    queryKey: ["facilities"],
    queryFn: () => apiData<HealthFacility[]>("/facilities"),
  });

  const createAnc = useMutation({
    mutationFn: (data: AncFormData) =>
      apiData<MchRecord>("/mch", {
        method: "POST",
        body: {
          patientId: data.patientId,
          recordType: data.recordType,
          gestationalAgeWeeks: Number(data.gestationalAgeWeeks),
          visitNumber: data.visitNumber ? Number(data.visitNumber) : undefined,
          fundalHeight: data.fundalHeight ? Number(data.fundalHeight) : undefined,
          fetalHeartRate: data.fetalHeartRate ? Number(data.fetalHeartRate) : undefined,
          muac: data.muac ? Number(data.muac) : undefined,
          highRiskFlag: data.highRiskFlag === "true",
          riskFactors: data.riskFactors,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mch-records", selectedPatientId] });
      queryClient.invalidateQueries({ queryKey: ["mch-high-risk"] });
      setShowAncDialog(false);
      ancForm.reset();
      toast({ title: "MCH record added", description: "Antenatal record saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add record", description: error.message, variant: "destructive" });
    },
  });

  const createImmunization = useMutation({
    mutationFn: (data: ImmunizationFormData) =>
      apiData<Immunization>("/immunizations", {
        method: "POST",
        body: {
          patientId: data.patientId,
          vaccineName: data.vaccineName,
          doseNumber: data.doseNumber ? Number(data.doseNumber) : undefined,
          nextDueDate: data.nextDueDate || undefined,
          facilityId: data.facilityId || user?.facility?.facilityId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizations-due"] });
      setShowImmDialog(false);
      immForm.reset();
      toast({ title: "Immunization recorded", description: "Schedule updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to record immunization", description: error.message, variant: "destructive" });
    },
  });

  const ancForm = useForm<AncFormData>({
    resolver: zodResolver(ancSchema),
    defaultValues: {
      patientId: "",
      recordType: "ANC Visit",
      gestationalAgeWeeks: "",
      visitNumber: "",
      fundalHeight: "",
      fetalHeartRate: "",
      muac: "",
      highRiskFlag: "false",
      riskFactors: "",
    },
  });

  const immForm = useForm<ImmunizationFormData>({
    resolver: zodResolver(immunizationSchema),
    defaultValues: {
      patientId: "",
      vaccineName: "",
      doseNumber: "",
      nextDueDate: "",
      facilityId: user?.facility?.facilityId ?? "",
    },
  });

  useEffect(() => {
    if (!selectedPatientId) return;
    ancForm.setValue("patientId", selectedPatientId, { shouldValidate: true });
  }, [selectedPatientId, ancForm]);

  useEffect(() => {
    if (!user?.facility?.facilityId) return;
    if (!immForm.getValues("facilityId")) {
      immForm.setValue("facilityId", user.facility.facilityId, { shouldValidate: true });
    }
  }, [user?.facility?.facilityId, immForm]);

  const highRiskCount = highRiskRecords.length;

  const immunizationStats = useMemo(() => ({
    overdue: immunizationsDue.filter((im) => immunizationStatus(im.nextDueDate) === "Overdue").length,
    due: immunizationsDue.filter((im) => immunizationStatus(im.nextDueDate) === "Due").length,
  }), [immunizationsDue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Maternal & Child Health</h1>
        <p className="text-muted-foreground text-sm mt-1">Track antenatal care, immunizations, and child growth</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "MCH Records", value: mchRecords.length, icon: Heart, color: "text-primary bg-primary/10", sub: `${highRiskCount} high risk` },
          { label: "High Risk Cases", value: highRiskCount, icon: AlertTriangle, color: "text-destructive bg-destructive/10", sub: "Flagged for follow-up" },
          { label: "Due Immunizations", value: immunizationStats.due, icon: Calendar, color: "text-warning bg-warning/10", sub: "Due within 7 days" },
          { label: "Overdue Immunizations", value: immunizationStats.overdue, icon: Baby, color: "text-info bg-info/10", sub: "Need immediate action" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-md ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Patient selector */}
      <div className="max-w-md">
        <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a patient to view ANC records" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((p) => (
              <SelectItem key={p.patientId} value={p.patientId}>
                {p.firstName} {p.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="antenatal">
        <TabsList>
          <TabsTrigger value="antenatal">Antenatal Care ({mchRecords.length})</TabsTrigger>
          <TabsTrigger value="immunization">Immunizations ({immunizationsDue.length})</TabsTrigger>
        </TabsList>

        {/* ANC Tab */}
        <TabsContent value="antenatal" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAncDialog(true)} disabled={!selectedPatientId || !canCreate}>
              <Plus className="w-4 h-4" />Add ANC Record
            </Button>
          </div>
          {!selectedPatientId ? (
            <div className="text-center py-12 text-muted-foreground text-sm">Select a patient to view ANC records.</div>
          ) : mchRecords.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No ANC records available.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mchRecords.map((anc) => (
                <div key={anc.mchId} className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{anc.patient?.firstName} {anc.patient?.lastName}</h3>
                        <p className="text-xs text-muted-foreground">{anc.mchId?.slice(0, 8)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={anc.highRiskFlag ? "destructive" : "success"} className="text-[10px]">
                        {anc.highRiskFlag ? "High Risk" : "Low Risk"}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewAnc(anc)}>
                            <Eye className="mr-2 h-4 w-4" />View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Week progress */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Gestational Age</span>
                      <span className="font-medium text-foreground">Week {anc.gestationalAgeWeeks ?? "—"} / 40</span>
                    </div>
                    <Progress value={((anc.gestationalAgeWeeks ?? 0) / 40) * 100} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Recorded: {formatDate(anc.recordedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Visit {anc.visitNumber ?? "—"}
                    </div>
                    {anc.fundalHeight && <div>Fundal height: {anc.fundalHeight} cm</div>}
                    {anc.fetalHeartRate && <div>FHR: {anc.fetalHeartRate} bpm</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Immunization Tab */}
        <TabsContent value="immunization" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowImmDialog(true)} disabled={!canCreate}>
              <Plus className="w-4 h-4" />Record Immunization
            </Button>
          </div>
          {immunizationsDue.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No immunizations due.</div>
          ) : (
            <div className="space-y-3">
              {immunizationsDue.map((im) => {
                const status = immunizationStatus(im.nextDueDate);
                return (
                  <div key={im.immunizationId} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{im.patient?.firstName} {im.patient?.lastName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{im.vaccineName} · Dose {im.doseNumber ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{formatDate(im.nextDueDate)}</span>
                      <Badge variant={status === "Overdue" ? "destructive" : status === "Due" ? "warning" : "info"} className="text-[10px]">
                        {status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add ANC Dialog */}
      <Dialog open={showAncDialog} onOpenChange={setShowAncDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add ANC Record</DialogTitle>
            <DialogDescription>Capture a new antenatal care visit.</DialogDescription>
          </DialogHeader>
          <Form {...ancForm}>
            <form onSubmit={ancForm.handleSubmit((data) => createAnc.mutate(data))} className="space-y-4">
              <FormField control={ancForm.control} name="patientId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || selectedPatientId}>
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
              <FormField control={ancForm.control} name="recordType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <FormControl><Input placeholder="ANC Visit" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={ancForm.control} name="gestationalAgeWeeks" render={({ field }) => (
                  <FormItem><FormLabel>Gestational Age (weeks)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={ancForm.control} name="visitNumber" render={({ field }) => (
                  <FormItem><FormLabel>Visit Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={ancForm.control} name="fundalHeight" render={({ field }) => (
                  <FormItem><FormLabel>Fundal Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={ancForm.control} name="fetalHeartRate" render={({ field }) => (
                  <FormItem><FormLabel>Fetal Heart Rate</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={ancForm.control} name="muac" render={({ field }) => (
                  <FormItem><FormLabel>MUAC (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={ancForm.control} name="highRiskFlag" render={({ field }) => (
                  <FormItem>
                    <FormLabel>High Risk</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="false">No</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={ancForm.control} name="riskFactors" render={({ field }) => (
                <FormItem>
                  <FormLabel>Risk Factors</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Describe risk factors..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAncDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createAnc.isPending}>Save Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Immunization Dialog */}
      <Dialog open={showImmDialog} onOpenChange={setShowImmDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Immunization</DialogTitle>
            <DialogDescription>Register vaccine administration and next due date.</DialogDescription>
          </DialogHeader>
          <Form {...immForm}>
            <form onSubmit={immForm.handleSubmit((data) => createImmunization.mutate(data))} className="space-y-4">
              <FormField control={immForm.control} name="patientId" render={({ field }) => (
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
              <FormField control={immForm.control} name="vaccineName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine</FormLabel>
                  <FormControl><Input placeholder="e.g. DPT-1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={immForm.control} name="doseNumber" render={({ field }) => (
                  <FormItem><FormLabel>Dose Number</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={immForm.control} name="nextDueDate" render={({ field }) => (
                  <FormItem><FormLabel>Next Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={immForm.control} name="facilityId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Facility</FormLabel>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowImmDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createImmunization.isPending}>Save Immunization</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View ANC dialog */}
      <Dialog open={!!viewAnc} onOpenChange={(open) => !open && setViewAnc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ANC Details</DialogTitle>
          </DialogHeader>
          {viewAnc && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{viewAnc.patient?.firstName} {viewAnc.patient?.lastName}</p>
                <p className="text-xs text-muted-foreground">{viewAnc.mchId?.slice(0, 8)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Gestational Age", value: viewAnc.gestationalAgeWeeks ? `Week ${viewAnc.gestationalAgeWeeks}` : "—" },
                  { label: "Visit", value: viewAnc.visitNumber ?? "—" },
                  { label: "Fundal Height", value: viewAnc.fundalHeight ? `${viewAnc.fundalHeight} cm` : "—" },
                  { label: "Fetal HR", value: viewAnc.fetalHeartRate ? `${viewAnc.fetalHeartRate} bpm` : "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewAnc.riskFactors && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Risk Factors</p>
                  <p className="text-sm text-foreground">{viewAnc.riskFactors}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewAnc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
