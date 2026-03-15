package com.afiaconnect.backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ImmunizationDTO {
    private UUID patientId;
    private String vaccineName;
    private Integer doseNumber;
    private LocalDate nextDueDate;
    private UUID facilityId;
}