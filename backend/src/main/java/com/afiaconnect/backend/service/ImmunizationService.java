package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.ImmunizationDTO;
import com.afiaconnect.backend.entity.Immunization;

import java.util.List;
import java.util.UUID;

public interface ImmunizationService {
    Immunization createImmunization(ImmunizationDTO dto, String administeredByEmail);
    List<Immunization> getImmunizationsByPatient(UUID patientId);
    List<Immunization> getDueImmunizations();
}
