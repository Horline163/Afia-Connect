package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.PatientDTO;
import com.afiaconnect.backend.entity.Patient;
import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.PatientRepository;
import com.afiaconnect.backend.repository.UserRepository;
import com.afiaconnect.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    public Patient createPatient(PatientDTO dto, String createdByEmail) {
        User createdBy = userRepository.findByEmail(createdByEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Patient patient = Patient.builder()
                .nationalId(dto.getNationalId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender())
                .phoneNumber(dto.getPhoneNumber())
                .village(dto.getVillage())
                .healthArea(dto.getHealthArea())
                .gpsHome(dto.getGpsHome())
                .emergencyContact(dto.getEmergencyContact())
                .createdBy(createdBy)
                .build();

        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient getPatientById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    @Override
    public Patient updatePatient(UUID id, PatientDTO dto) {
        Patient patient = getPatientById(id);
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setVillage(dto.getVillage());
        patient.setHealthArea(dto.getHealthArea());
        patient.setEmergencyContact(dto.getEmergencyContact());
        return patientRepository.save(patient);
    }

    @Override
    public List<Patient> searchPatients(String query) {
        return patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrNationalIdContainingIgnoreCase(
                        query, query, query);
    }
}