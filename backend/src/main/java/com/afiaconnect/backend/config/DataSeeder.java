package com.afiaconnect.backend.config;

import com.afiaconnect.backend.entity.HealthFacility;
import com.afiaconnect.backend.entity.User;
import com.afiaconnect.backend.repository.HealthFacilityRepository;
import com.afiaconnect.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HealthFacilityRepository facilityRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "Afia@1234";

    @Override
    public void run(String... args) {
        seedFacilities();
        seedUsers();
    }

    private void seedFacilities() {
        if (facilityRepository.count() > 0) return;

        List<HealthFacility> facilities = List.of(
                HealthFacility.builder()
                        .name("Nord-Kivu Health Center")
                        .type("Health Center")
                        .district("Goma")
                        .province("Nord-Kivu")
                        .contactPhone("+243 812 000 001")
                        .build(),
                HealthFacility.builder()
                        .name("Goma Provincial Hospital")
                        .type("Hospital")
                        .district("Goma")
                        .province("Nord-Kivu")
                        .contactPhone("+243 812 000 002")
                        .build(),
                HealthFacility.builder()
                        .name("Virunga District Hospital")
                        .type("Hospital")
                        .district("Goma")
                        .province("Nord-Kivu")
                        .contactPhone("+243 812 000 003")
                        .build()
        );

        facilityRepository.saveAll(facilities);
    }

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        List<HealthFacility> facilities = facilityRepository.findAll();
        HealthFacility primaryFacility = facilities.isEmpty() ? null : facilities.get(0);
        HealthFacility secondaryFacility = facilities.size() > 1 ? facilities.get(1) : primaryFacility;

        createUserIfMissing(
                "admin",
                "admin@afia.local",
                "Administrator",
                "Admin",
                "User",
                primaryFacility
        );
        createUserIfMissing(
                "doctor1",
                "doctor1@afia.local",
                "Doctor",
                "Jean",
                "Mugabo",
                secondaryFacility
        );
        createUserIfMissing(
                "nurse1",
                "nurse1@afia.local",
                "Nurse",
                "Esperance",
                "K.",
                primaryFacility
        );
        createUserIfMissing(
                "chw1",
                "chw1@afia.local",
                "CHW",
                "Tania",
                "Horline",
                primaryFacility
        );
    }

    private void createUserIfMissing(
            String username,
            String email,
            String role,
            String firstName,
            String lastName,
            HealthFacility facility
    ) {
        if (userRepository.existsByEmail(email) || userRepository.existsByUsername(username)) return;

        User user = User.builder()
                .username(username)
                .email(email)
                .role(role)
                .firstName(firstName)
                .lastName(lastName)
                .facility(facility)
                .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                .build();

        userRepository.save(user);
    }
}
