package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.VitalSignsDTO;
import com.afiaconnect.backend.entity.VitalSigns;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.MedicalRecordRepository;
import com.afiaconnect.backend.repository.VitalSignsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vital-signs")
@RequiredArgsConstructor
public class VitalSignsController {

    private final VitalSignsRepository vitalSignsRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<VitalSigns>> create(@RequestBody VitalSignsDTO dto) {
        VitalSigns vitals = VitalSigns.builder()
                .record(medicalRecordRepository.findById(dto.getRecordId())
                        .orElseThrow(() -> new ResourceNotFoundException("Record not found")))
                .temperature(dto.getTemperature())
                .heartRate(dto.getHeartRate())
                .respiratoryRate(dto.getRespiratoryRate())
                .bloodPressureSystolic(dto.getBloodPressureSystolic())
                .bloodPressureDiastolic(dto.getBloodPressureDiastolic())
                .oxygenSaturation(dto.getOxygenSaturation())
                .weight(dto.getWeight())
                .height(dto.getHeight())
                .build();

        return ResponseEntity.status(201).body(ApiResponse.success("Vital signs recorded",
                vitalSignsRepository.save(vitals)));
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<ApiResponse<VitalSigns>> getByRecord(@PathVariable UUID recordId) {
        VitalSigns vitals = vitalSignsRepository.findByRecord(
                medicalRecordRepository.findById(recordId)
                        .orElseThrow(() -> new ResourceNotFoundException("Record not found")))
                .orElseThrow(() -> new ResourceNotFoundException("Vital signs not found"));
        return ResponseEntity.ok(ApiResponse.success(vitals));
    }
}