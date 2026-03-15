package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Appointment;
import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientOrderByScheduledDateDesc(Patient patient);
    List<Appointment> findByScheduledWithAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAsc(
        User scheduledWith, String status, LocalDate date);
    List<Appointment> findByScheduledDate(LocalDate date);
    Long countByScheduledDate(LocalDate date);
    Long countByStatus(String status);
}