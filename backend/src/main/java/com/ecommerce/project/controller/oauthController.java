package com.ecommerce.project.controller;

import com.ecommerce.project.model.Role;
import com.ecommerce.project.model.AppRole;
import com.ecommerce.project.model.User;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.Collections;
import java.util.Map;
import java.util.Set;

import com.ecommerce.project.repositories.UserRepository;
import com.ecommerce.project.repositories.RoleRepository;
import com.ecommerce.project.security.jwt.JwtUtils;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@RestController
@RequestMapping("/api/auth")
public class oauthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RoleRepository roleRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @PostMapping("/login/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) throws Exception {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing token");
        }

        // Verify Google Token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(token);
        if (idToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
        }

        if (!Boolean.TRUE.equals(idToken.getPayload().getEmailVerified())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email not verified");
        }

        String email = idToken.getPayload().getEmail();
        Object nameClaim = idToken.getPayload().get("name");
        String name = nameClaim != null ? nameClaim.toString() : email;

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUserName(name);
                    newUser.setEmail(email);

                    Role userRole = roleRepository.findByRoleName(AppRole.ROLE_USER)
                            .orElseThrow(() -> new RuntimeException("Role USER not found"));

                    newUser.setRoles(Set.of(userRole));
                    return userRepository.save(newUser);
                });

        String jwt = jwtUtils.generateTokenFromUsername(user.getEmail());

        return ResponseEntity.ok(Map.of("token", jwt, "user", user));
    }
}