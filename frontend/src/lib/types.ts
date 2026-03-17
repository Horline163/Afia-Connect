export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type HealthFacility = {
  facilityId: string;
  name: string;
  type?: string;
  district?: string;
  province?: string;
  gpsCoordinates?: string;
  contactPhone?: string;
};

export type User = {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  facility?: HealthFacility | null;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
};

export type Patient = {
  patientId: string;
  nationalId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  village?: string;
  healthArea?: string;
  gpsHome?: string;
  emergencyContact?: string;
  createdAt?: string;
  createdBy?: User | null;
};

export type Consultation = {
  consultationId: string;
  patient: Patient;
  initiatedBy?: User | null;
  doctor?: User | null;
  status?: string;
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  consultationType?: string;
  consultationNotes?: string;
  sessionRecordingUrl?: string;
};

export type Referral = {
  referralId: string;
  patient: Patient;
  initiatedBy?: User | null;
  fromFacility?: HealthFacility | null;
  toFacility?: HealthFacility | null;
  priority?: string;
  reason?: string;
  status?: string;
  createdAt?: string;
  completedAt?: string;
  feedbackNotes?: string;
};

export type Appointment = {
  appointmentId: string;
  patient: Patient;
  scheduledWith?: User | null;
  appointmentType?: string;
  scheduledDate?: string;
  status?: string;
  notes?: string;
};

export type MedicalRecord = {
  recordId: string;
  patient: Patient;
  recordedBy?: User | null;
  recordedAt?: string;
  visitType?: string;
  symptoms?: string;
  vitals?: Record<string, unknown> | null;
  diagnosisNotes?: string;
  icd10Code?: string;
  facility?: HealthFacility | null;
};

export type Immunization = {
  immunizationId: string;
  patient: Patient;
  vaccineName?: string;
  doseNumber?: number;
  administeredAt?: string;
  nextDueDate?: string;
  administeredBy?: User | null;
  facility?: HealthFacility | null;
};

export type MchRecord = {
  mchId: string;
  patient: Patient;
  recordType?: string;
  gestationalAgeWeeks?: number;
  visitNumber?: number;
  fundalHeight?: number;
  fetalHeartRate?: number;
  muac?: number;
  highRiskFlag?: boolean;
  riskFactors?: string;
  recordedAt?: string;
};

export type Notification = {
  notificationId: string;
  type?: string;
  channel?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  sentAt?: string;
};
