package com.afiaconnect.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ReferralDTO {
    private UUID patientId;
    private UUID fromFacilityId;
    private UUID toFacilityId;
    private String priority;
    private String reason;
    private String status;
    private String feedbackNotes;
    private String hospitalDiagnosis;
    private String treatmentSummary;
    private String dischargeInstructions;
    private Boolean followUpRequired;
}