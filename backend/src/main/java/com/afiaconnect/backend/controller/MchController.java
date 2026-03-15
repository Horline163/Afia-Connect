package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.MchRecordDTO;
import com.afiaconnect.backend.entity.MchRecord;
import com.afiaconnect.backend.service.MchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mch")
@RequiredArgsConstructor
public class MchController {

    private final MchService mchService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<MchRecord>> create(@RequestBody MchRecordDTO dto) {
        return ResponseEntity.status(201).body(ApiResponse.success("MCH record created",
                mchService.createRecord(dto)));
    }

    @GetMapping("/high-risk")
    @PreAuthorize("hasAnyRole('Doctor','Administrator')")
    public ResponseEntity<ApiResponse<List<MchRecord>>> highRisk() {
        return ResponseEntity.ok(ApiResponse.success(mchService.getHighRiskPatients()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MchRecord>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(mchService.getRecordsByPatient(patientId)));
    }
}