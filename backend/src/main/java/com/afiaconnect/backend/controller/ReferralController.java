package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.ReferralDTO;
import com.afiaconnect.backend.entity.Referral;
import com.afiaconnect.backend.entity.ReferralFeedback;
import com.afiaconnect.backend.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/referrals")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse')")
    public ResponseEntity<ApiResponse<Referral>> create(@RequestBody ReferralDTO dto,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        Referral referral = referralService.createReferral(dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Referral created", referral));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Referral>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(referralService.getReferralsByPatient(patientId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Referral>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(referralService.getReferralById(id)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('Doctor','Administrator')")
    public ResponseEntity<ApiResponse<Referral>> updateStatus(@PathVariable UUID id,
                                                               @RequestBody ReferralDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Referral updated",
                referralService.updateStatus(id, dto.getStatus(), dto.getFeedbackNotes())));
    }

    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<ApiResponse<ReferralFeedback>> submitFeedback(@PathVariable UUID id,
                                                                          @RequestBody ReferralDTO dto,
                                                                          @AuthenticationPrincipal UserDetails userDetails) {
        ReferralFeedback feedback = referralService.submitFeedback(id, dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(ApiResponse.success("Feedback submitted", feedback));
    }
}