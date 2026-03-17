package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.ConsultationDTO;
import com.afiaconnect.backend.entity.Consultation;
import java.util.List;
import java.util.UUID;

public interface ConsultationService {
    Consultation createConsultation(ConsultationDTO dto, String initiatedByEmail);
    List<Consultation> getConsultationsByPatient(UUID patientId);
    Consultation getConsultationById(UUID id);
    Consultation updateStatus(UUID id, String status, String notes);
    List<Consultation> getDoctorConsultations(String doctorEmail);
    List<Consultation> getInitiatedConsultations(String initiatedByEmail);
}
