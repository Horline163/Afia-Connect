package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.ReferralDTO;
import com.afiaconnect.backend.entity.*;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.ReferralService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReferralServiceImpl implements ReferralService {

    private final ReferralRepository referralRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HealthFacilityRepository facilityRepository;
    private final ReferralFeedbackRepository referralFeedbackRepository;

    @Override
    public Referral createReferral(ReferralDTO dto, String initiatedByEmail) {
        Referral referral = Referral.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .initiatedBy(userRepository.findByEmail(initiatedByEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")))
                .fromFacility(facilityRepository.findById(dto.getFromFacilityId())
                        .orElseThrow(() -> new ResourceNotFoundException("Facility not found")))
                .toFacility(facilityRepository.findById(dto.getToFacilityId())
                        .orElseThrow(() -> new ResourceNotFoundException("Facility not found")))
                .priority(dto.getPriority())
                .reason(dto.getReason())
                .build();

        return referralRepository.save(referral);
    }

    @Override
    public List<Referral> getReferralsByPatient(UUID patientId) {
        return referralRepository.findByPatientOrderByCreatedAtDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public Referral getReferralById(UUID id) {
        return referralRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Referral not found"));
    }

    @Override
    public Referral updateStatus(UUID id, String status, String feedbackNotes) {
        Referral referral = getReferralById(id);
        referral.setStatus(status);
        referral.setFeedbackNotes(feedbackNotes);
        if (status.equals("Completed")) referral.setCompletedAt(LocalDateTime.now());
        return referralRepository.save(referral);
    }

    @Override
    public ReferralFeedback submitFeedback(UUID referralId, ReferralDTO dto, String doctorEmail) {
        Referral referral = getReferralById(referralId);
        User doctor = userRepository.findByEmail(doctorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        ReferralFeedback feedback = ReferralFeedback.builder()
                .referral(referral)
                .hospitalDiagnosis(dto.getHospitalDiagnosis())
                .treatmentSummary(dto.getTreatmentSummary())
                .dischargeInstructions(dto.getDischargeInstructions())
                .followUpRequired(dto.getFollowUpRequired())
                .providedBy(doctor)
                .build();

        return referralFeedbackRepository.save(feedback);
    }

    @Override
    public List<Referral> getReferralsByInitiator(String initiatedByEmail) {
        User user = userRepository.findByEmail(initiatedByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return referralRepository.findByInitiatedByOrderByCreatedAtDesc(user);
    }

    @Override
    public List<Referral> getAllReferrals() {
        return referralRepository.findAll();
    }
}
