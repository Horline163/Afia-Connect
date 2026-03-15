package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.ReferralFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ReferralFeedbackRepository extends JpaRepository<ReferralFeedback, UUID> {
}