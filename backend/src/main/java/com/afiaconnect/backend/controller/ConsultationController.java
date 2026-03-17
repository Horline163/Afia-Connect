package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.ConsultationDTO;
import com.afiaconnect.backend.entity.Consultation;
import com.afiaconnect.backend.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<Consultation>> create(@RequestBody ConsultationDTO dto,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        Consultation consultation = consultationService.createConsultation(dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Consultation requested", consultation));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<ApiResponse<List<Consultation>>> myConsultations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                consultationService.getDoctorConsultations(userDetails.getUsername())));
    }

    @GetMapping("/initiated")
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<List<Consultation>>> initiatedConsultations(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                consultationService.getInitiatedConsultations(userDetails.getUsername())));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Consultation>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                consultationService.getConsultationsByPatient(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Consultation>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(consultationService.getConsultationById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<ApiResponse<Consultation>> updateStatus(@PathVariable UUID id,
                                                                   @RequestBody ConsultationDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Consultation updated",
                consultationService.updateStatus(id, dto.getStatus(), dto.getConsultationNotes())));
    }
}
