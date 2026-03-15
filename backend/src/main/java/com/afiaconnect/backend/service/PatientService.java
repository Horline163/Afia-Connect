package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.PatientDTO;
import com.afiaconnect.backend.entity.Patient;
import java.util.List;
import java.util.UUID;

public interface PatientService {
    Patient createPatient(PatientDTO dto, String createdByEmail);
    List<Patient> getAllPatients();
    Patient getPatientById(UUID id);
    Patient updatePatient(UUID id, PatientDTO dto);
    List<Patient> searchPatients(String query);
}