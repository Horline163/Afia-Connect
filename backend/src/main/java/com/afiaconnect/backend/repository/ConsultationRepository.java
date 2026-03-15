package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Consultation;
import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {
    List<Consultation> findByPatientOrderByScheduledTimeDesc(Patient patient);
    List<Consultation> findByDoctorOrderByScheduledTimeDesc(User doctor);
    List<Consultation> findByInitiatedByOrderByScheduledTimeDesc(User initiatedBy);
    Long countByDoctor(User doctor);
    Long countByDoctorAndStatus(User doctor, String status);
}