package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.MedicalRecordDTO;
import com.afiaconnect.backend.entity.MedicalRecord;
import java.util.List;
import java.util.UUID;

public interface MedicalRecordService {
    MedicalRecord createRecord(MedicalRecordDTO dto, String recordedByEmail);
    List<MedicalRecord> getRecordsByPatient(UUID patientId);
    MedicalRecord getRecordById(UUID id);
    MedicalRecord updateRecord(UUID id, MedicalRecordDTO dto);
}