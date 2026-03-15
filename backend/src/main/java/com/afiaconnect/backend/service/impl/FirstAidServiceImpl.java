package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.VitalSignsDTO;
import com.afiaconnect.backend.entity.FirstAidRecommendation;
import com.afiaconnect.backend.repository.FirstAidRecommendationRepository;
import com.afiaconnect.backend.service.FirstAidService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FirstAidServiceImpl implements FirstAidService {

    private final FirstAidRecommendationRepository repository;

    @Override
    public List<Map<String, String>> analyzeVitals(VitalSignsDTO dto) {
        List<Map<String, String>> recommendations = new ArrayList<>();

        if (dto.getTemperature() != null && dto.getTemperature().compareTo(new BigDecimal("38")) >= 0) {
            recommendations.add(Map.of(
                "condition", "High Fever",
                "action", "Administer paracetamol, ensure hydration, monitor temperature.",
                "medication", "Paracetamol 500mg",
                "referral", "Refer if fever persists more than 2 days or exceeds 39.5°C.",
                "source", "WHO Guidelines"
            ));
        }

        if (dto.getTemperature() != null && dto.getTemperature().compareTo(new BigDecimal("35")) < 0) {
            recommendations.add(Map.of(
                "condition", "Hypothermia",
                "action", "Keep patient warm using blankets and warm fluids if conscious.",
                "medication", "No medication without doctor prescription.",
                "referral", "Refer urgently if condition persists.",
                "source", "Red Cross First Aid Guidelines"
            ));
        }

        if (dto.getBloodPressureSystolic() != null && dto.getBloodPressureSystolic() >= 140) {
            recommendations.add(Map.of(
                "condition", "High Blood Pressure",
                "action", "Advise patient to rest, reduce salt intake, avoid stress.",
                "medication", "No medication without doctor prescription.",
                "referral", "Refer to hospital for evaluation immediately.",
                "source", "WHO Hypertension Guidelines"
            ));
        }

        if (dto.getOxygenSaturation() != null && dto.getOxygenSaturation().compareTo(new BigDecimal("95")) < 0) {
            recommendations.add(Map.of(
                "condition", "Low Oxygen Saturation",
                "action", "Keep patient seated upright, ensure fresh air, loosen tight clothing.",
                "medication", "No medication without doctor prescription.",
                "referral", "Refer urgently to nearest health facility.",
                "source", "WHO Guidelines"
            ));
        }

        if (dto.getHeartRate() != null && dto.getHeartRate() > 100) {
            recommendations.add(Map.of(
                "condition", "High Heart Rate",
                "action", "Ask patient to rest, avoid caffeine, monitor closely.",
                "medication", "No medication without doctor prescription.",
                "referral", "Refer if heart rate remains above 100 bpm after rest.",
                "source", "WHO Guidelines"
            ));
        }

        if (dto.getSymptoms() != null) {
            String symptoms = dto.getSymptoms().toLowerCase();

            if (symptoms.contains("diarrhea") || symptoms.contains("diarrhoea")) {
                recommendations.add(Map.of(
                    "condition", "Severe Diarrhea / Dehydration Risk",
                    "action", "Provide ORS and encourage fluid intake.",
                    "medication", "ORS (Oral Rehydration Solution)",
                    "referral", "Refer if symptoms worsen or severe dehydration appears.",
                    "source", "WHO Guidelines"
                ));
            }

            if (symptoms.contains("bleeding") || symptoms.contains("wound")) {
                recommendations.add(Map.of(
                    "condition", "Wound or Bleeding",
                    "action", "Clean wound with clean water, apply antiseptic and bandage.",
                    "medication", "Antiseptic solution, sterile bandage.",
                    "referral", "Refer if wound is deep or bleeding heavily.",
                    "source", "Red Cross First Aid Guidelines"
                ));
            }

            if (symptoms.contains("headache") && symptoms.contains("fever")) {
                recommendations.add(Map.of(
                    "condition", "Severe Headache with Fever",
                    "action", "Administer paracetamol and recommend immediate malaria testing.",
                    "medication", "Paracetamol 500mg",
                    "referral", "Refer immediately for malaria testing.",
                    "source", "WHO Malaria Guidelines"
                ));
            }
        }

        return recommendations;
    }

    @Override
    public List<FirstAidRecommendation> getAllRecommendations() {
        return repository.findAll();
    }

    @Override
    public FirstAidRecommendation createRecommendation(FirstAidRecommendation recommendation) {
        return repository.save(recommendation);
    }

    @Override
    public List<FirstAidRecommendation> getByCondition(String condition) {
        return repository.findByConditionContainingIgnoreCase(condition);
    }
}