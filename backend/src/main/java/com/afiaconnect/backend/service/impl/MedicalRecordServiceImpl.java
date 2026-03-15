package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.MedicalRecordDTO;
import com.afiaconnect.backend.entity.MedicalRecord;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HealthFacilityRepository facilityRepository;

    @Override
    public MedicalRecord createRecord(MedicalRecordDTO dto, String recordedByEmail) {
        MedicalRecord record = MedicalRecord.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .recordedBy(userRepository.findByEmail(recordedByEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")))
                .visitType(dto.getVisitType())
                .symptoms(dto.getSymptoms())
                .vitals(dto.getVitals())
                .diagnosisNotes(dto.getDiagnosisNotes())
                .icd10Code(dto.getIcd10Code())
                .facility(dto.getFacilityId() != null ?
                        facilityRepository.findById(dto.getFacilityId()).orElse(null) : null)
                .build();

        return medicalRecordRepository.save(record);
    }

    @Override
    public List<MedicalRecord> getRecordsByPatient(UUID patientId) {
        return medicalRecordRepository.findByPatientOrderByRecordedAtDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public MedicalRecord getRecordById(UUID id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Record not found"));
    }

    @Override
    public MedicalRecord updateRecord(UUID id, MedicalRecordDTO dto) {
        MedicalRecord record = getRecordById(id);
        record.setDiagnosisNotes(dto.getDiagnosisNotes());
        record.setIcd10Code(dto.getIcd10Code());
        return medicalRecordRepository.save(record);
    }
}