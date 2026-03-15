package com.afiaconnect.backend.service;

import com.afiaconnect.backend.dto.AuthRequest;
import com.afiaconnect.backend.dto.AuthResponse;
import com.afiaconnect.backend.entity.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    User register(User user, String password);
    User getMe(String email);
}