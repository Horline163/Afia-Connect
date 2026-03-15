package com.afiaconnect.backend.repository;

import com.afiaconnect.backend.entity.HealthFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface HealthFacilityRepository extends JpaRepository<HealthFacility, UUID> {
}