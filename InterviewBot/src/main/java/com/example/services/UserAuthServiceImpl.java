package com.example.services;

import com.example.DTO.UserLoginRequest;
import com.example.DTO.UserRegistrationRequest;
import com.example.Entity.Users;
import com.example.auth.Configuration.CustomUserDetailsService;
import com.example.auth.Configuration.JwtConfig;
import com.example.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAuthServiceImpl implements UserAuthService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private CustomUserDetailsService customUserDetailsService;
    @Autowired
    AuthenticationManager  authenticationManager;

    BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();

    @Autowired
    JwtConfig jwtConfig;
    @Override
    public ResponseEntity<?> registerUser(UserRegistrationRequest request) {
        Users users=new Users();
        users.setEmail(request.getEmail());
        users.setPassword(encoder.encode(request.getPassword()));
        users.setFullName(request.getFullName());
        if (userRepo.findByEmail(request.getEmail()) != null) {
            return ResponseEntity.badRequest().body("User with this email already exists.");
        }
        userRepo.save(users);
        return ResponseEntity.ok("User registered successfully with email: " + request.getEmail());
    }

    @Override
    public ResponseEntity<?> loginUser(UserLoginRequest request) {
        Users users=new Users();
        users.setEmail(request.getEmail());
        users.setPassword(request.getPassword());
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(users.getEmail(), users.getPassword())
        );
        if (authentication.isAuthenticated()){
            UserDetails userDetails=customUserDetailsService.loadUserByUsername(request.getEmail());
            String token;
            if (userDetails != null)
                token= jwtConfig.generateToken(userDetails);
            else throw new RuntimeException("User not found with email: " + request.getEmail());

            return ResponseEntity.ok().body("User logged in successfully with email: " + request.getEmail() + ". Token: " + token);

        }else
            return ResponseEntity.badRequest().body("Invalid email or password.");
    }
}
