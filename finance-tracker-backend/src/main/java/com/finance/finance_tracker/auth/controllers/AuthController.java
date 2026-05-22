package com.finance.finance_tracker.auth.controllers;

import com.finance.finance_tracker.auth.dtos.AuthRequest;
import com.finance.finance_tracker.auth.dtos.AuthResponse;
import com.finance.finance_tracker.auth.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest req) {
        String token = authService.register(req.username(), req.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        String token = authService.login(req.username(), req.password());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
