package com.example.services;

import com.example.DTO.UserLoginRequest;
import com.example.DTO.UserRegistrationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface UserAuthService {
    ResponseEntity<?> registerUser(UserRegistrationRequest request);

    ResponseEntity<?> loginUser(UserLoginRequest request);
}
