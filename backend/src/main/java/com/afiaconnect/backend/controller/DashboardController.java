package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('Administrator')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
    }

    @GetMapping("/chw")
    @PreAuthorize("hasRole('CHW')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chwDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getCHWDashboard(userDetails.getUsername())));
    }

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('Doctor')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> doctorDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                dashboardService.getDoctorDashboard(userDetails.getUsername())));
    }
}