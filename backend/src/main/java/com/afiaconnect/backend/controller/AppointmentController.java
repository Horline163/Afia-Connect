package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.AppointmentDTO;
import com.afiaconnect.backend.entity.Appointment;
import com.afiaconnect.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse','Doctor')")
    public ResponseEntity<ApiResponse<Appointment>> create(@RequestBody AppointmentDTO dto) {
        return ResponseEntity.status(201).body(ApiResponse.success("Appointment scheduled",
                appointmentService.createAppointment(dto)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Appointment>>> upcoming(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getUpcomingAppointments(userDetails.getUsername())));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getAppointmentsByPatient(patientId)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Appointment>> updateStatus(@PathVariable UUID id,
                                                                   @RequestBody AppointmentDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Appointment updated",
                appointmentService.updateStatus(id, dto.getStatus())));
    }
}