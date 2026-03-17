package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.ReferralDTO;
import com.afiaconnect.backend.entity.Referral;
import com.afiaconnect.backend.entity.ReferralFeedback;

import java.util.List;
import java.util.UUID;

public interface ReferralService {
    Referral createReferral(ReferralDTO dto, String initiatedByEmail);
    List<Referral> getReferralsByPatient(UUID patientId);
    Referral getReferralById(UUID id);
    Referral updateStatus(UUID id, String status, String feedbackNotes);
    ReferralFeedback submitFeedback(UUID referralId, ReferralDTO dto, String doctorEmail);
    List<Referral> getReferralsByInitiator(String initiatedByEmail);
    List<Referral> getAllReferrals();
}
