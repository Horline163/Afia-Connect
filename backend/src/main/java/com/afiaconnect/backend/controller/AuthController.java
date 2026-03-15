package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.dto.AuthRequest;
import com.afiaconnect.backend.dto.AuthResponse;
import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody User user,
                                                       @RequestParam String password) {
        User created = authService.register(user, password);
        return ResponseEntity.status(201).body(ApiResponse.success("User registered successfully", created));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getMe(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}