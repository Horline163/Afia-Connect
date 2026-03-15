package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Immunization;
import com.afiaconnect.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ImmunizationRepository extends JpaRepository<Immunization, UUID> {
    List<Immunization> findByPatientOrderByAdministeredAtDesc(Patient patient);

    @Query("SELECT i FROM Immunization i WHERE i.nextDueDate <= :dueDate")
    List<Immunization> findDueImmunizations(LocalDate dueDate);
}