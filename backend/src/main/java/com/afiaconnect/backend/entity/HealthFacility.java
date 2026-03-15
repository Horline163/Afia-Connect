package com.afiaconnect.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "health_facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID facilityId;

    @Column(nullable = false)
    private String name;

    private String type;
    private String district;
    private String province;
    private String gpsCoordinates;
    private String contactPhone;
