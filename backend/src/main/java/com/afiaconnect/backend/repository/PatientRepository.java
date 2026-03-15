package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    List<Patient> findByCreatedBy(User createdBy);
    List<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrNationalIdContainingIgnoreCase(
        String firstName, String lastName, String nationalId);
}