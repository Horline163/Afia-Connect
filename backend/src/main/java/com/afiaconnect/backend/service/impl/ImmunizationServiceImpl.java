package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.ImmunizationDTO;
import com.afiaconnect.backend.entity.Immunization;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.ImmunizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImmunizationServiceImpl implements ImmunizationService {

    private final ImmunizationRepository immunizationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final HealthFacilityRepository facilityRepository;

    @Override
    public Immunization createImmunization(ImmunizationDTO dto, String administeredByEmail) {
        Immunization immunization = Immunization.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .vaccineName(dto.getVaccineName())
                .doseNumber(dto.getDoseNumber())
                .nextDueDate(dto.getNextDueDate())
                .administeredBy(userRepository.findByEmail(administeredByEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")))
                .facility(dto.getFacilityId() != null ?
                        facilityRepository.findById(dto.getFacilityId()).orElse(null) : null)
                .build();

        return immunizationRepository.save(immunization);
    }

    @Override
    public List<Immunization> getImmunizationsByPatient(UUID patientId) {
        return immunizationRepository.findByPatientOrderByAdministeredAtDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public List<Immunization> getDueImmunizations() {
        return immunizationRepository.findDueImmunizations(LocalDate.now().plusDays(7));
    }
}