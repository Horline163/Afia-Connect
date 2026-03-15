package com.afiaconnect.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class VitalSignsDTO {
    private UUID recordId;
    private BigDecimal temperature;
    private Integer heartRate;
    private Integer respiratoryRate;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private BigDecimal oxygenSaturation;
    private BigDecimal weight;
    private BigDecimal height;
    private String symptoms;
}