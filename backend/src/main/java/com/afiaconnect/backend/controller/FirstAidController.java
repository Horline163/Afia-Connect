package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.VitalSignsDTO;
import com.afiaconnect.backend.entity.FirstAidRecommendation;
import com.afiaconnect.backend.service.FirstAidService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/first-aid")
@RequiredArgsConstructor
public class FirstAidController {

    private final FirstAidService firstAidService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> analyze(@RequestBody VitalSignsDTO dto) {
        List<Map<String, String>> recommendations = firstAidService.analyzeVitals(dto);
        return ResponseEntity.ok(ApiResponse.success(
                recommendations.isEmpty() ? "Vitals normal. No immediate first aid required."
                        : recommendations.size() + " recommendation(s) found.",
                recommendations));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FirstAidRecommendation>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(firstAidService.getAllRecommendations()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Administrator','Doctor')")
    public ResponseEntity<ApiResponse<FirstAidRecommendation>> create(
            @RequestBody FirstAidRecommendation recommendation) {
        return ResponseEntity.status(201).body(ApiResponse.success("Recommendation added",
                firstAidService.createRecommendation(recommendation)));
    }

    @GetMapping("/{condition}")
    public ResponseEntity<ApiResponse<List<FirstAidRecommendation>>> getByCondition(
            @PathVariable String condition) {
        return ResponseEntity.ok(ApiResponse.success(firstAidService.getByCondition(condition)));
    }
}