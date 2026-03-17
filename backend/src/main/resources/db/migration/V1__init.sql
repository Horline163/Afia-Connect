-- Initial schema for Afia-Connect (PostgreSQL)

create table health_facilities (
  facility_id uuid primary key,
  name varchar(255) not null,
  type varchar(255),
  district varchar(255),
  province varchar(255),
  gps_coordinates varchar(255),
  contact_phone varchar(255)
);

create table users (
  user_id uuid primary key,
  username varchar(255) not null unique,
  password_hash varchar(255) not null,
  email varchar(255) not null unique,
  phone_number varchar(255),
  first_name varchar(255),
  last_name varchar(255),
  role varchar(50) not null,
  facility_id uuid references health_facilities(facility_id),
  is_active boolean default true,
  created_at timestamp default now(),
  last_login timestamp
);

create table patients (
  patient_id uuid primary key,
  national_id varchar(255),
  first_name varchar(255) not null,
  last_name varchar(255) not null,
  date_of_birth date,
  gender varchar(50),
  phone_number varchar(255),
  village varchar(255),
  health_area varchar(255),
  gps_home varchar(255),
  emergency_contact varchar(255),
  created_at timestamp default now(),
  created_by uuid references users(user_id)
);

create table medications (
  medication_id uuid primary key,
  name varchar(255) not null,
  generic_name varchar(255),
  dosage_form varchar(255),
  strength varchar(255),
  is_essential boolean default false
);

create table medical_records (
  record_id uuid primary key,
  patient_id uuid references patients(patient_id),
  recorded_by uuid references users(user_id),
  recorded_at timestamp default now(),
  visit_type varchar(255),
  symptoms text,
  vitals jsonb,
  diagnosis_notes text,
  icd10_code varchar(50),
  facility_id uuid references health_facilities(facility_id)
);

create table vital_signs (
  vital_id uuid primary key,
  record_id uuid references medical_records(record_id),
  temperature numeric(10,2),
  heart_rate integer,
  respiratory_rate integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  oxygen_saturation numeric(10,2),
  weight numeric(10,2),
  height numeric(10,2),
  recorded_at timestamp default now()
);

create table appointments (
  appointment_id uuid primary key,
  patient_id uuid references patients(patient_id),
  scheduled_with uuid references users(user_id),
  appointment_type varchar(255),
  scheduled_date date,
  status varchar(50) default 'Scheduled',
  reminder_sent boolean default false,
  notes text
);

create table consultations (
  consultation_id uuid primary key,
  patient_id uuid references patients(patient_id),
  initiated_by uuid references users(user_id),
  doctor_id uuid references users(user_id),
  status varchar(50) default 'Requested',
  scheduled_time timestamp,
  start_time timestamp,
  end_time timestamp,
  consultation_type varchar(255),
  consultation_notes text,
  session_recording_url text
);

create table immunizations (
  immunization_id uuid primary key,
  patient_id uuid references patients(patient_id),
  vaccine_name varchar(255),
  dose_number integer,
  administered_at timestamp default now(),
  next_due_date date,
  administered_by uuid references users(user_id),
  facility_id uuid references health_facilities(facility_id)
);

create table notifications (
  notification_id uuid primary key,
  user_id uuid references users(user_id),
  type varchar(255),
  channel varchar(255),
  title varchar(255),
  message text,
  is_read boolean default false,
  created_at timestamp default now(),
  sent_at timestamp
);

create table mch_records (
  mch_id uuid primary key,
  patient_id uuid references patients(patient_id),
  record_type varchar(255),
  gestational_age_weeks integer,
  visit_number integer,
  fundal_height numeric(10,2),
  fetal_heart_rate integer,
  muac numeric(10,2),
  high_risk_flag boolean default false,
  risk_factors text,
  recorded_at timestamp default now()
);

create table prescriptions (
  prescription_id uuid primary key,
  record_id uuid references medical_records(record_id),
  medication_id uuid references medications(medication_id),
  prescribed_by uuid references users(user_id),
  dosage_instruction text,
  quantity integer,
  refills integer default 0,
  prescribed_at timestamp default now()
);

create table referrals (
  referral_id uuid primary key,
  patient_id uuid references patients(patient_id),
  initiated_by uuid references users(user_id),
  from_facility_id uuid references health_facilities(facility_id),
  to_facility_id uuid references health_facilities(facility_id),
  priority varchar(50),
  reason text,
  status varchar(50) default 'Pending',
  created_at timestamp default now(),
  completed_at timestamp,
  feedback_notes text
);

create table referral_feedback (
  feedback_id uuid primary key,
  referral_id uuid unique references referrals(referral_id),
  hospital_diagnosis text,
  treatment_summary text,
  discharge_instructions text,
  follow_up_required boolean default false,
  provided_by uuid references users(user_id),
  provided_at timestamp default now()
);

create table first_aid_recommendations (
  recommendation_id uuid primary key,
  condition varchar(255),
  symptom_pattern varchar(255),
  vital_thresholds jsonb,
  action_text text,
  medication_text text,
  referral_advice text,
  source_guideline text
);

create table audit_logs (
  log_id uuid primary key,
  user_id uuid references users(user_id),
  action varchar(255),
  entity_name varchar(255),
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address varchar(255),
  timestamp timestamp default now()
);

create index idx_users_facility_id on users(facility_id);
create index idx_patients_created_by on patients(created_by);
create index idx_appointments_patient_id on appointments(patient_id);
create index idx_appointments_scheduled_with on appointments(scheduled_with);
create index idx_consultations_patient_id on consultations(patient_id);
create index idx_consultations_initiated_by on consultations(initiated_by);
create index idx_consultations_doctor_id on consultations(doctor_id);
create index idx_immunizations_patient_id on immunizations(patient_id);
create index idx_immunizations_administered_by on immunizations(administered_by);
create index idx_immunizations_facility_id on immunizations(facility_id);
create index idx_notifications_user_id on notifications(user_id);
create index idx_medical_records_patient_id on medical_records(patient_id);
create index idx_medical_records_recorded_by on medical_records(recorded_by);
create index idx_medical_records_facility_id on medical_records(facility_id);
create index idx_vital_signs_record_id on vital_signs(record_id);
create index idx_prescriptions_record_id on prescriptions(record_id);
create index idx_prescriptions_medication_id on prescriptions(medication_id);
create index idx_prescriptions_prescribed_by on prescriptions(prescribed_by);
create index idx_referrals_patient_id on referrals(patient_id);
create index idx_referrals_initiated_by on referrals(initiated_by);
create index idx_referrals_from_facility_id on referrals(from_facility_id);
create index idx_referrals_to_facility_id on referrals(to_facility_id);
create index idx_referral_feedback_referral_id on referral_feedback(referral_id);
create index idx_referral_feedback_provided_by on referral_feedback(provided_by);
create index idx_mch_records_patient_id on mch_records(patient_id);
create index idx_audit_logs_user_id on audit_logs(user_id);
