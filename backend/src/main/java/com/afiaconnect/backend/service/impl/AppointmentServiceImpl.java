package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.AppointmentDTO;
import com.afiaconnect.backend.entity.Appointment;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    public Appointment createAppointment(AppointmentDTO dto) {
        Appointment appointment = Appointment.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .scheduledWith(userRepository.findById(dto.getScheduledWith())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")))
                .appointmentType(dto.getAppointmentType())
                .scheduledDate(dto.getScheduledDate())
                .notes(dto.getNotes())
                .build();

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getAppointmentsByPatient(UUID patientId) {
        return appointmentRepository.findByPatientOrderByScheduledDateDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public Appointment updateStatus(UUID id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<Appointment> getUpcomingAppointments(String userEmail) {
        return appointmentRepository
                .findByScheduledWithAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAsc(
                        userRepository.findByEmail(userEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found")),
                        "Scheduled",
                        LocalDate.now());
    }
}