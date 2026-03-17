import { useMemo, useState } from "react";
import { Search, UserPlus, MoreHorizontal, Eye, Edit, Phone, Calendar, MapPin, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiData } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Patient } from "@/lib/types";

const patientSchema = z.object({
  nationalId: z.string().optional(),
  firstName: z.string().min(2, "First name required"),
  lastName: z.string().min(2, "Last name required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  phoneNumber: z.string().optional(),
  village: z.string().optional(),
  healthArea: z.string().optional(),
  gpsHome: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

function patientDisplayId(patient: Patient) {
  if (patient.nationalId) return patient.nationalId;
  return patient.patientId?.slice(0, 8).toUpperCase();
}

function patientAge(patient: Patient) {
  if (!patient.dateOfBirth) return "—";
  const dob = new Date(patient.dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";
  const diff = Date.now() - dob.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  return years.toString();
}

function displayGender(value?: string) {
  if (!value) return "—";
  const normalized = value.toLowerCase();
  if (normalized === "m") return "Male";
  if (normalized === "f") return "Female";
  return value;
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "yyyy-MM-dd");
}

function cleanValue(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [viewPatient, setViewPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = (user?.role ?? "").toLowerCase();
  const canManage = role === "chw" || role === "nurse" || role === "administrator";

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => apiData<Patient[]>("/patients"),
  });

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return patients.filter((p) => {
      const matchesSearch =
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query) ||
        p.patientId?.toLowerCase().includes(query) ||
        (p.nationalId?.toLowerCase().includes(query) ?? false) ||
        (p.phoneNumber?.toLowerCase().includes(query) ?? false);
      const rawGender = (p.gender ?? "").toLowerCase();
      const normalizedGender =
        rawGender === "m" ? "male" :
        rawGender === "f" ? "female" :
        rawGender;
      const matchesGender =
        genderFilter === "all" ||
        (genderFilter === "other" ? !["male", "female"].includes(normalizedGender) : normalizedGender === genderFilter);
      return matchesSearch && matchesGender;
    });
  }, [patients, searchQuery, genderFilter]);

  const createPatient = useMutation({
    mutationFn: (data: PatientFormData) =>
      apiData<Patient>("/patients", {
        method: "POST",
        body: {
          nationalId: cleanValue(data.nationalId),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          dateOfBirth: cleanValue(data.dateOfBirth),
          gender: cleanValue(data.gender),
          phoneNumber: cleanValue(data.phoneNumber),
          village: cleanValue(data.village),
          healthArea: cleanValue(data.healthArea),
          gpsHome: cleanValue(data.gpsHome),
          emergencyContact: cleanValue(data.emergencyContact),
        },
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setShowNewDialog(false);
      form.reset();
      toast({ title: "Patient registered", description: `${created.firstName} ${created.lastName} has been added.` });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to register patient", description: error.message, variant: "destructive" });
    },
  });

  const updatePatient = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormData }) =>
      apiData<Patient>(`/patients/${id}`, {
        method: "PUT",
        body: {
          nationalId: cleanValue(data.nationalId),
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          dateOfBirth: cleanValue(data.dateOfBirth),
          gender: cleanValue(data.gender),
          phoneNumber: cleanValue(data.phoneNumber),
          village: cleanValue(data.village),
          healthArea: cleanValue(data.healthArea),
          gpsHome: cleanValue(data.gpsHome),
          emergencyContact: cleanValue(data.emergencyContact),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setEditPatient(null);
      toast({ title: "Patient updated", description: "Record has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update patient", description: error.message, variant: "destructive" });
    },
  });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      nationalId: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      phoneNumber: "",
      village: "",
      healthArea: "",
      gpsHome: "",
      emergencyContact: "",
    },
  });

  const editForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  function onSubmit(data: PatientFormData) {
    createPatient.mutate(data);
  }

  function onEditSubmit(data: PatientFormData) {
    if (!editPatient) return;
    updatePatient.mutate({ id: editPatient.patientId, data });
  }

  function openEdit(patient: Patient) {
    editForm.reset({
      nationalId: patient.nationalId ?? "",
      firstName: patient.firstName ?? "",
      lastName: patient.lastName ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      gender: patient.gender ?? "",
      phoneNumber: patient.phoneNumber ?? "",
      village: patient.village ?? "",
      healthArea: patient.healthArea ?? "",
      gpsHome: patient.gpsHome ?? "",
      emergencyContact: patient.emergencyContact ?? "",
    });
    setEditPatient(patient);
  }

  const genderStats = useMemo(() => {
    const counts = { male: 0, female: 0, other: 0 };
    patients.forEach((p) => {
      const gender = (p.gender ?? "").toLowerCase();
      if (gender === "m" || gender === "male") counts.male += 1;
      else if (gender === "f" || gender === "female") counts.female += 1;
      else counts.other += 1;
    });
    return counts;
  }, [patients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} disabled={!canManage}>
          <UserPlus className="w-4 h-4" />
          New Patient
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Male", count: genderStats.male, color: "text-info bg-info/10" },
          { label: "Female", count: genderStats.female, color: "text-primary bg-primary/10" },
          { label: "Other / Unknown", count: genderStats.other, color: "text-muted-foreground bg-secondary/50" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.count}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
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
        <div className="flex items-center gap-1.5">
          {["all", "male", "female", "other"].map((g) => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                genderFilter === g ? "bg-primary/10 text-primary border border-primary/30" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {["ID", "Patient", "Age", "Gender", "Contact", "Location", "Registered", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-heading font-medium text-muted-foreground px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((patient) => (
                  <tr key={patient.patientId} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{patientDisplayId(patient)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground font-medium">{patient.firstName} {patient.lastName}</p>
                        {(patient.village || patient.healthArea) && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {patient.healthArea ?? patient.village}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{patientAge(patient)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{displayGender(patient.gender)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {patient.phoneNumber ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{patient.healthArea ?? patient.village ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(patient.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewPatient(patient)}>
                            <Eye className="mr-2 h-4 w-4" />View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(patient)} disabled={!canManage}>
                            <Edit className="mr-2 h-4 w-4" />Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled className="text-muted-foreground">
                            Deletion disabled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {patients.length} patients</p>
        </div>
      </div>

      {/* New Patient Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Patient</DialogTitle>
            <DialogDescription>Fill in the patient's information to create their health record.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nationalId" render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID (optional)</FormLabel>
                  <FormControl><Input placeholder="NID-12345" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input placeholder="Marie" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input placeholder="Kabila" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="+243 812 345 678" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="village" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Village</FormLabel>
                    <FormControl><Input placeholder="Goma" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="healthArea" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Area</FormLabel>
                    <FormControl><Input placeholder="Nord-Kivu" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="gpsHome" render={({ field }) => (
                <FormItem>
                  <FormLabel>GPS Home (optional)</FormLabel>
                  <FormControl><Input placeholder="-1.678, 29.222" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact (optional)</FormLabel>
                  <FormControl><Input placeholder="+243 812 000 111" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createPatient.isPending}>Register Patient</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={!!editPatient} onOpenChange={(open) => !open && setEditPatient(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient — {editPatient?.firstName} {editPatient?.lastName}</DialogTitle>
            <DialogDescription>Update the patient's information.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField control={editForm.control} name="nationalId" render={({ field }) => (
                <FormItem>
                  <FormLabel>National ID</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={editForm.control} name="dateOfBirth" render={({ field }) => (
                  <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="gender" render={({ field }) => (
                  <FormItem><FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={editForm.control} name="phoneNumber" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={editForm.control} name="village" render={({ field }) => (
                  <FormItem><FormLabel>Village</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={editForm.control} name="healthArea" render={({ field }) => (
                  <FormItem><FormLabel>Health Area</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={editForm.control} name="gpsHome" render={({ field }) => (
                <FormItem><FormLabel>GPS Home</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="emergencyContact" render={({ field }) => (
                <FormItem><FormLabel>Emergency Contact</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditPatient(null)}>Cancel</Button>
                <Button type="submit" disabled={updatePatient.isPending}>Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog open={!!viewPatient} onOpenChange={(open) => !open && setViewPatient(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {viewPatient && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-heading font-bold text-primary">
                    {`${viewPatient.firstName?.[0] ?? ""}${viewPatient.lastName?.[0] ?? ""}`.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground">{viewPatient.firstName} {viewPatient.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{patientDisplayId(viewPatient)} · {patientAge(viewPatient)} yrs · {displayGender(viewPatient.gender)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Phone", value: viewPatient.phoneNumber ?? "—" },
                  { label: "Village", value: viewPatient.village ?? "—" },
                  { label: "Health Area", value: viewPatient.healthArea ?? "—" },
                  { label: "National ID", value: viewPatient.nationalId ?? "—" },
                  { label: "Registered", value: formatDate(viewPatient.createdAt) },
                  { label: "Emergency", value: viewPatient.emergencyContact ?? "—" },
                ].map((item) => (
                  <div key={item.label} className="bg-secondary/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
              {viewPatient.gpsHome && (
                <div className="bg-secondary/50 rounded-md p-3">
                  <p className="text-xs text-muted-foreground mb-1">GPS Home</p>
                  <p className="text-sm text-foreground">{viewPatient.gpsHome}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPatient(null)}>Close</Button>
            {viewPatient && canManage && (
              <Button onClick={() => { openEdit(viewPatient); setViewPatient(null); }}>
                <Edit className="w-4 h-4" />Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
