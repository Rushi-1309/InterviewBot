package com.example.auth.Configuration;

import com.example.Entity.Users;
import com.example.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    UserRepo repo;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users users= repo.findByEmail(username);
    if (users != null) {
            return new CustomUserDetails(users);
        }
        throw  new UsernameNotFoundException("User not found with email: " + username);
    }
}
