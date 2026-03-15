package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.PatientDTO;
import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse','Administrator')")
    public ResponseEntity<ApiResponse<Patient>> create(@Valid @RequestBody PatientDTO dto,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        Patient patient = patientService.createPatient(dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Patient registered", patient));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Patient>>> getAll(@RequestParam(required = false) String search) {
        List<Patient> patients = search != null ? patientService.searchPatients(search) : patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CHW','Nurse','Administrator')")
    public ResponseEntity<ApiResponse<Patient>> update(@PathVariable UUID id,
                                                        @RequestBody PatientDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Patient updated", patientService.updatePatient(id, dto)));
    }
}