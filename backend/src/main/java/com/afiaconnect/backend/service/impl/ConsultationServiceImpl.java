package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.ConsultationDTO;
import com.afiaconnect.backend.entity.Consultation;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.*;
import com.afiaconnect.backend.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    public Consultation createConsultation(ConsultationDTO dto, String initiatedByEmail) {
        Consultation consultation = Consultation.builder()
                .patient(patientRepository.findById(dto.getPatientId())
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")))
                .initiatedBy(userRepository.findByEmail(initiatedByEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")))
                .doctor(userRepository.findById(dto.getDoctorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Doctor not found")))
                .consultationType(dto.getConsultationType())
                .scheduledTime(dto.getScheduledTime())
                .build();

        return consultationRepository.save(consultation);
    }

    @Override
    public List<Consultation> getConsultationsByPatient(UUID patientId) {
        return consultationRepository.findByPatientOrderByScheduledTimeDesc(
                patientRepository.findById(patientId)
                        .orElseThrow(() -> new ResourceNotFoundException("Patient not found")));
    }

    @Override
    public Consultation getConsultationById(UUID id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
    }

    @Override
    public Consultation updateStatus(UUID id, String status, String notes) {
        Consultation consultation = getConsultationById(id);
        consultation.setStatus(status);
        consultation.setConsultationNotes(notes);
        return consultationRepository.save(consultation);
    }

    @Override
    public List<Consultation> getDoctorConsultations(String doctorEmail) {
        return consultationRepository.findByDoctorOrderByScheduledTimeDesc(
                userRepository.findByEmail(doctorEmail)
                        .orElseThrow(() -> new ResourceNotFoundException("Doctor not found")));
    }
}