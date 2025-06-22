package com.example.controller;

import com.example.DTO.UserLoginRequest;
import com.example.DTO.UserRegistrationRequest;
import com.example.services.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/user-auth")
//@CrossOrigin("*")
public class UserAuthController {
    @Autowired
    UserAuthService userAuthService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserRegistrationRequest request) {
        return userAuthService.registerUser(request);
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserLoginRequest request) {
        return userAuthService.loginUser(request);
    }

}
