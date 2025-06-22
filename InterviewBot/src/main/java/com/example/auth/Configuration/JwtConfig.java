package com.example.auth.Configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.*;

@Component
public class JwtConfig {

    private static final String  SECRET_KEY="VGhpcyBpcyBhIHZlcnkgc2VjdXJlIHNlY3JldCBrZXk";

    public String generateToken(UserDetails userDetails){

        return createToken(userDetails.getUsername());
    }
    public boolean isValidToken(String token, UserDetails userDetails) {
        String username = exytractUSername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private String createToken(String username) {
      return   Jwts.builder().
                subject(username).
                claim("email",username).
                signWith(SignatureAlgorithm.HS256,getSecretKey()).
                issuedAt(new Date(System.currentTimeMillis())).
                expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)).
                compact();
    }
    private Claims extractClaims(String token){
        Claims claims= Jwts.parser().
                verifyWith(getSecretKey()).
                build().
                parseSignedClaims(token).
                getPayload();
        return claims;
    }
    public String exytractUSername(String token){
        return extractClaims(token).getSubject();
    }
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private SecretKey getSecretKey() {
        byte[] decodedKey = java.util.Base64.getDecoder().decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(decodedKey);
    }
}