package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.ImmunizationDTO;
import com.afiaconnect.backend.entity.Immunization;
import com.afiaconnect.backend.service.ImmunizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/immunizations")
@RequiredArgsConstructor
public class ImmunizationController {

    private final ImmunizationService immunizationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<Immunization>> create(@RequestBody ImmunizationDTO dto,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(ApiResponse.success("Immunization recorded",
                immunizationService.createImmunization(dto, userDetails.getUsername())));
    }

    @GetMapping("/due")
    @PreAuthorize("hasAnyRole('CHW','Nurse','Administrator')")
    public ResponseEntity<ApiResponse<List<Immunization>>> due() {
        return ResponseEntity.ok(ApiResponse.success(immunizationService.getDueImmunizations()));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Immunization>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                immunizationService.getImmunizationsByPatient(patientId)));
    }
}