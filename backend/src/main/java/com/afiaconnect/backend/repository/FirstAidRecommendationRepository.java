package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.FirstAidRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FirstAidRecommendationRepository extends JpaRepository<FirstAidRecommendation, UUID> {
    List<FirstAidRecommendation> findByConditionContainingIgnoreCase(String condition);
}