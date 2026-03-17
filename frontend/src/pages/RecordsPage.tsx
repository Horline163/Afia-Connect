import { useEffect, useMemo, useState } from "react";
import {
  FileText, Search, Plus, Calendar, X, Filter,
  Eye, Stethoscope, Baby, ClipboardList, Syringe, MoreHorizontal,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { MedicalRecord, Patient } from "@/lib/types";

const recordTypes = ["Visit Log", "Diagnosis", "Antenatal", "Follow-up", "Vitals", "Immunization", "Prescription", "Lab Result"] as const;

const recordSchema = z.object({
  visitType: z.string().min(1, "Record type required"),
  symptoms: z.string().optional(),
  diagnosisNotes: z.string().optional(),
  icd10Code: z.string().optional(),
  temperature: z.string().optional(),
  heartRate: z.string().optional(),
  bloodPressureSystolic: z.string().optional(),
  bloodPressureDiastolic: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
});

type RecordFormData = z.infer<typeof recordSchema>;

const typeIcons: Record<string, any> = {
  "Visit Log": ClipboardList,
  "Diagnosis": Stethoscope,
  "Antenatal": Baby,
  "Follow-up": ClipboardList,
  "Vitals": Stethoscope,
  "Immunization": Syringe,
  "Prescription": FileText,
  "Lab Result": FileText,
};

const typeBadgeVariant: Record<string, any> = {
  "Visit Log": "secondary",
  "Diagnosis": "destructive",
  "Antenatal": "info",
  "Follow-up": "success",
  "Vitals": "warning",
  "Immunization": "info",
  "Prescription": "secondary",
  "Lab Result": "secondary",
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}

function buildVitals(data: RecordFormData) {
  const vitals: Record<string, number> = {};
  const add = (key: string, value?: string) => {
    if (!value) return;
    const number = Number(value);
    if (!Number.isNaN(number)) vitals[key] = number;
  };
  add("temperature", data.temperature);
  add("heartRate", data.heartRate);
  add("bloodPressureSystolic", data.bloodPressureSystolic);
  add("bloodPressureDiastolic", data.bloodPressureDiastolic);
  add("oxygenSaturation", data.oxygenSaturation);
  add("weight", data.weight);
  add("height", data.height);
  return Object.keys(vitals).length ? vitals : undefined;
}

export default function RecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = (user?.role ?? "").toLowerCase();
  const canCreate = role === "chw" || role === "nurse" || role === "doctor";

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", "records"],
    queryFn: () => apiData<Patient[]>("/patients"),
  });

  useEffect(() => {
    if (!selectedPatientId && patients.length) {
      setSelectedPatientId(patients[0].patientId);
    }
  }, [patients, selectedPatientId]);

  const { data: records = [] } = useQuery({
    queryKey: ["medical-records", selectedPatientId],
    queryFn: () => apiData<MedicalRecord[]>(`/medical-records/patient/${selectedPatientId}`),
    enabled: !!selectedPatientId,
  });

  const createRecord = useMutation({
    mutationFn: (data: RecordFormData) =>
      apiData<MedicalRecord>("/medical-records", {
        method: "POST",
        body: {
          patientId: selectedPatientId,
          visitType: data.visitType,
          symptoms: data.symptoms,
          diagnosisNotes: data.diagnosisNotes,
          icd10Code: data.icd10Code,
          vitals: buildVitals(data),
          facilityId: user?.facility?.facilityId,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-records", selectedPatientId] });
      setShowNewDialog(false);
      form.reset();
      toast({ title: "Record created", description: "Medical record saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create record", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      visitType: "",
      symptoms: "",
      diagnosisNotes: "",
      icd10Code: "",
      temperature: "",
      heartRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
    },
  });

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        `${r.patient?.firstName ?? ""} ${r.patient?.lastName ?? ""}`.toLowerCase().includes(query) ||
        (r.recordId?.toLowerCase().includes(query) ?? false) ||
        (r.diagnosisNotes ?? "").toLowerCase().includes(query) ||
        (r.symptoms ?? "").toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || r.visitType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [records, searchQuery, typeFilter]);

  function onSubmit(data: RecordFormData) {
    if (!selectedPatientId) {
      toast({ title: "Select a patient first", variant: "destructive" });
      return;
    }
    createRecord.mutate(data);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Health Records</h1>
          <p className="text-muted-foreground text-sm mt-1">Electronic health records and clinical documentation</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} disabled={!selectedPatientId || !canCreate}>
          <Plus className="w-4 h-4" />
          New Record
        </Button>
      </div>

      {/* Patient Selector */}
      <div className="max-w-md">
        <Select onValueChange={setSelectedPatientId} value={selectedPatientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a patient to view records" />
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

      {/* Type distribution */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { type: "Visit Log", count: records.filter(r => r.visitType === "Visit Log").length },
          { type: "Antenatal", count: records.filter(r => r.visitType === "Antenatal").length },
          { type: "Diagnosis", count: records.filter(r => r.visitType === "Diagnosis").length },
          { type: "Immunization", count: records.filter(r => r.visitType === "Immunization").length },
        ].map((s) => (
          <button
            key={s.type}
            onClick={() => setTypeFilter(typeFilter === s.type ? "all" : s.type)}
            className={`bg-card border rounded-lg p-4 text-left transition-colors ${typeFilter === s.type ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}
          >
            <p className="text-xs text-muted-foreground">{s.type}</p>
            <p className="text-2xl font-heading font-bold text-foreground mt-1">{s.count}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === "all" ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            All
          </button>
          {recordTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(typeFilter === t ? "all" : t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${typeFilter === t ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Records list */}
      <div className="space-y-2">
        {!selectedPatientId ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Select a patient to view records.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No records match your search.</div>
        ) : (
          filtered.map((r) => {
            const Icon = typeIcons[r.visitType ?? "Visit Log"] || FileText;
            const summary = r.diagnosisNotes || r.symptoms || "—";
            return (
              <div
                key={r.recordId}
                className="bg-card border border-border rounded-lg p-5 hover:border-border/80 transition-colors cursor-pointer"
                onClick={() => setViewRecord(r)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-secondary rounded-md mt-0.5 flex-shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{r.recordId?.slice(0, 8)}</span>
                      <Badge variant={typeBadgeVariant[r.visitType ?? "Visit Log"] || "secondary"} className="text-[10px]">{r.visitType}</Badge>
                    </div>
                    <h3 className="text-sm font-medium text-foreground">{r.patient?.firstName} {r.patient?.lastName}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(r.recordedAt)}</span>
                      {r.vitals && <span className="text-info">Vitals recorded</span>}
                      {r.icd10Code && <span className="text-success">ICD10: {r.icd10Code}</span>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setViewRecord(r); }}>
                        <Eye className="mr-2 h-4 w-4" />View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Record Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Medical Record</DialogTitle>
            <DialogDescription>Add a new clinical record for this patient.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="visitType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Record Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {recordTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="symptoms" render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptoms</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Describe symptoms..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="diagnosisNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis Notes</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="Diagnosis and treatment notes..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icd10Code" render={({ field }) => (
                <FormItem>
                  <FormLabel>ICD-10 Code (optional)</FormLabel>
                  <FormControl><Input placeholder="e.g. I10" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="temperature" render={({ field }) => (
                  <FormItem><FormLabel>Temperature (°C)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="heartRate" render={({ field }) => (
                  <FormItem><FormLabel>Heart Rate (bpm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="bloodPressureSystolic" render={({ field }) => (
                  <FormItem><FormLabel>BP Systolic</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="bloodPressureDiastolic" render={({ field }) => (
                  <FormItem><FormLabel>BP Diastolic</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="oxygenSaturation" render={({ field }) => (
                  <FormItem><FormLabel>O2 Saturation (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createRecord.isPending}>Save Record</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
          </DialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{viewRecord.patient?.firstName} {viewRecord.patient?.lastName}</p>
                <p className="text-xs text-muted-foreground">{viewRecord.recordId?.slice(0, 8)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Type", value: viewRecord.visitType ?? "—" },
                  { label: "Recorded", value: formatDate(viewRecord.recordedAt) },
                  { label: "ICD-10", value: viewRecord.icd10Code ?? "—" },
                  { label: "Facility", value: viewRecord.facility?.name ?? "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewRecord.symptoms && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Symptoms</p>
                  <p className="text-sm text-foreground">{viewRecord.symptoms}</p>
                </div>
              )}
              {viewRecord.diagnosisNotes && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">Diagnosis Notes</p>
                  <p className="text-sm text-foreground">{viewRecord.diagnosisNotes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
