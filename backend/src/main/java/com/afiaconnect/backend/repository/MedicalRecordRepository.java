package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.MedicalRecord;
import com.afiaconnect.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findByPatientOrderByRecordedAtDesc(Patient patient);
}