package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "first_aid_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FirstAidRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID recommendationId;

    private String condition;
    private String symptomPattern;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> vitalThresholds;

    private String actionText;
    private String medicationText;
    private String referralAdvice;
    private String sourceGuideline;
}