package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.MchRecordDTO;
import com.afiaconnect.backend.entity.MchRecord;

import java.util.List;
import java.util.UUID;

public interface MchService {
    MchRecord createRecord(MchRecordDTO dto);
    List<MchRecord> getRecordsByPatient(UUID patientId);
    List<MchRecord> getHighRiskPatients();
}
