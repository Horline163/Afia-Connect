package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.MchRecordDTO;
import com.afiaconnect.backend.entity.MchRecord;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.MchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MchServiceImpl implements MchService {

    private final MchRecordRepository mchRecordRepository;
    private final PatientRepository patientRepository;

    @Override
    public MchRecord createRecord(MchRecordDTO dto) {
        MchRecord record = MchRecord.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .recordType(dto.getRecordType())
                .gestationalAgeWeeks(dto.getGestationalAgeWeeks())
                .visitNumber(dto.getVisitNumber())
                .fundalHeight(dto.getFundalHeight())
                .fetalHeartRate(dto.getFetalHeartRate())
                .muac(dto.getMuac())
                .highRiskFlag(dto.getHighRiskFlag() != null ? dto.getHighRiskFlag() : false)
                .riskFactors(dto.getRiskFactors())
                .build();

        return mchRecordRepository.save(record);
    }

    @Override
    public List<MchRecord> getRecordsByPatient(UUID patientId) {
        return mchRecordRepository.findByPatientOrderByRecordedAtDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public List<MchRecord> getHighRiskPatients() {
        return mchRecordRepository.findByHighRiskFlagTrue();
    }
}