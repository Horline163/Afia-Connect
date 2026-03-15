package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.entity.Referral;
import com.afiaconnect.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReferralRepository extends JpaRepository<Referral, UUID> {
    List<Referral> findByPatientOrderByCreatedAtDesc(Patient patient);
    List<Referral> findByInitiatedByOrderByCreatedAtDesc(User initiatedBy);
    List<Referral> findByStatus(String status);
    Long countByInitiatedBy(User initiatedBy);
}