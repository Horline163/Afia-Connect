package com.afiaconnect.backend.controller;

import com.afiaconnect.backend.dto.ApiResponse;
import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('CHW','Nurse','Doctor','Administrator')")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(
            @RequestParam(required = false) String role) {
        List<User> users = role != null && !role.isBlank()
                ? userRepository.findByRoleIgnoreCase(role)
                : userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
