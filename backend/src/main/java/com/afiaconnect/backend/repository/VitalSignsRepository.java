package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.MedicalRecord;
import com.afiaconnect.backend.entity.VitalSigns;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface VitalSignsRepository extends JpaRepository<VitalSigns, UUID> {
    Optional<VitalSigns> findByRecord(MedicalRecord record);
}