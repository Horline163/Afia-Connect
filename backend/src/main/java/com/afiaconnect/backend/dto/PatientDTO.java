package com.afiaconnect.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientDTO {
    private String nationalId;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private String village;
    private String healthArea;
    private String gpsHome;
    private String emergencyContact;
}