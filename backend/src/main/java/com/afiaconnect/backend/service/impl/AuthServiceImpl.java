package com.afiaconnect.backend.service.impl;

import com.afiaconnect.backend.dto.AuthRequest;
import com.afiaconnect.backend.dto.AuthResponse;
import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.exception.ResourceNotFoundException;
import com.afiaconnect.backend.repository.UserRepository;
import com.afiaconnect.backend.security.JwtUtil;
import com.afiaconnect.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!user.getIsActive()) throw new RuntimeException("Account is disabled");

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getUserId().toString());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .username(user.getUsername())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Override
    public User register(User user, String password) {
        if (userRepository.existsByEmail(user.getEmail()))
            throw new RuntimeException("Email already exists");
        if (userRepository.existsByUsername(user.getUsername()))
            throw new RuntimeException("Username already exists");

        user.setPasswordHash(passwordEncoder.encode(password));
        return userRepository.save(user);
    }

    @Override
    public User getMe(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}