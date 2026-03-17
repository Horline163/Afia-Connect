package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.entity.HealthFacility;
import com.afiaconnect.backend.repository.HealthFacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class HealthFacilityController {

    private final HealthFacilityRepository facilityRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse','Doctor','Administrator')")
    public ResponseEntity<ApiResponse<List<HealthFacility>>> getFacilities() {
        return ResponseEntity.ok(ApiResponse.success(facilityRepository.findAll()));
    }
}
