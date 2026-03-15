package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final ConsultationRepository consultationRepository;
    private final ReferralRepository referralRepository;
    private final MchRecordRepository mchRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final ImmunizationRepository immunizationRepository;

    @Override
    public Map<String, Object> getAdminDashboard() {
        Map<String, Object> data = new HashMap<>();
        Map<String, Object> stats = new HashMap<>();

        stats.put("total_patients", patientRepository.count());
        stats.put("total_users", userRepository.count());
        stats.put("total_consultations", consultationRepository.count());
        stats.put("total_referrals", referralRepository.count());
        stats.put("pending_referrals", referralRepository.findByStatus("Pending").size());
        stats.put("high_risk_mch", mchRecordRepository.countByHighRiskFlagTrue());
        stats.put("today_appointments", appointmentRepository.countByScheduledDate(LocalDate.now()));
        stats.put("missed_appointments", appointmentRepository.countByStatus("Missed"));
        stats.put("due_immunizations", immunizationRepository.findDueImmunizations(LocalDate.now().plusDays(7)).size());

        data.put("stats", stats);
        data.put("recent_patients", patientRepository.findAll().stream().limit(5).toList());
        data.put("recent_referrals", referralRepository.findAll().stream().limit(5).toList());

        return data;
    }

    @Override
    public Map<String, Object> getCHWDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> data = new HashMap<>();
        Map<String, Object> stats = new HashMap<>();

        stats.put("my_patients", patientRepository.findByCreatedBy(user).size());
        stats.put("my_referrals", referralRepository.countByInitiatedBy(user));
        stats.put("my_consultations", consultationRepository.findByInitiatedByOrderByScheduledTimeDesc(user).size());

        data.put("stats", stats);
        data.put("recent_patients", patientRepository.findByCreatedBy(user).stream().limit(5).toList());
        data.put("pending_referrals", referralRepository.findByInitiatedByOrderByCreatedAtDesc(user)
                .stream().filter(r -> r.getStatus().equals("Pending")).limit(5).toList());
        data.put("upcoming_appointments", appointmentRepository
                .findByScheduledWithAndStatusAndScheduledDateGreaterThanEqualOrderByScheduledDateAsc(
                        user, "Scheduled", LocalDate.now()).stream().limit(5).toList());

        return data;
    }

    @Override
    public Map<String, Object> getDoctorDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, Object> data = new HashMap<>();
        Map<String, Object> stats = new HashMap<>();

        stats.put("my_consultations", consultationRepository.countByDoctor(user));
        stats.put("pending_consultations", consultationRepository.countByDoctorAndStatus(user, "Requested"));
        stats.put("completed_consultations", consultationRepository.countByDoctorAndStatus(user, "Completed"));
        stats.put("high_risk_patients", mchRecordRepository.countByHighRiskFlagTrue());

        data.put("stats", stats);
        data.put("recent_consultations", consultationRepository
                .findByDoctorOrderByScheduledTimeDesc(user).stream().limit(5).toList());

        return data;
    }
}