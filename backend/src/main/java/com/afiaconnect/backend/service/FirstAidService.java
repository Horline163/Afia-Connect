package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.VitalSignsDTO;
import com.afiaconnect.backend.entity.FirstAidRecommendation;

import java.util.List;
import java.util.Map;

public interface FirstAidService {
    List<Map<String, String>> analyzeVitals(VitalSignsDTO dto);
    List<FirstAidRecommendation> getAllRecommendations();
    FirstAidRecommendation createRecommendation(FirstAidRecommendation recommendation);
    List<FirstAidRecommendation> getByCondition(String condition);
}
