package com.afiaconnect.backend.dto;

import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class MedicalRecordDTO {
    private UUID patientId;
    private String visitType;
    private String symptoms;
    private Map<String, Object> vitals;
    private String diagnosisNotes;
    private String icd10Code;
    private UUID facilityId;
}