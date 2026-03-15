package com.afiaconnect.backend.dto;

import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private UUID userId;
    private String username;
    private String role;
    private String firstName;
    private String lastName;
}