package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.AppointmentDTO;
import com.afiaconnect.backend.entity.Appointment;

import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    Appointment createAppointment(AppointmentDTO dto);
    List<Appointment> getAppointmentsByPatient(UUID patientId);
    Appointment updateStatus(UUID id, String status);
    List<Appointment> getUpcomingAppointments(String userEmail);
}
