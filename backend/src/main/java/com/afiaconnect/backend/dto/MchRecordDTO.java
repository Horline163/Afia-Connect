package com.afiaconnect.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class MchRecordDTO {
    private UUID patientId;
    private String recordType;
    private Integer gestationalAgeWeeks;
    private Integer visitNumber;
    private BigDecimal fundalHeight;
    private Integer fetalHeartRate;
    private BigDecimal muac;
    private Boolean highRiskFlag;
    private String riskFactors;
}