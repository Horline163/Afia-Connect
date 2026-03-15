package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.MedicalRecordDTO;
import com.afiaconnect.backend.entity.MedicalRecord;
import com.afiaconnect.backend.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse','Doctor')")
    public ResponseEntity<ApiResponse<MedicalRecord>> create(@RequestBody MedicalRecordDTO dto,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        MedicalRecord record = medicalRecordService.createRecord(dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Medical record created", record));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalRecord>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordsByPatient(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecord>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Doctor','Nurse')")
    public ResponseEntity<ApiResponse<MedicalRecord>> update(@PathVariable UUID id,
                                                              @RequestBody MedicalRecordDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Record updated", medicalRecordService.updateRecord(id, dto)));
    }
}