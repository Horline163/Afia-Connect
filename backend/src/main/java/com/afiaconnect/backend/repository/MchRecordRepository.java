package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.MchRecord;
import com.afiaconnect.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MchRecordRepository extends JpaRepository<MchRecord, UUID> {
    List<MchRecord> findByPatientOrderByRecordedAtDesc(Patient patient);
    List<MchRecord> findByHighRiskFlagTrue();
    Long countByHighRiskFlagTrue();
}