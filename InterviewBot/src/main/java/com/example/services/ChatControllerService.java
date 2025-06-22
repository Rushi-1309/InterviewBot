package com.example.services;

import com.example.DTO.GetChatRequest;
import com.example.DTO.SaveChatRequest;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public interface ChatControllerService {
    ResponseEntity<?> startInterview(String resumeContent);

    ResponseEntity<?> answerQuestion(String answe);


    ResponseEntity<?> saveChat(SaveChatRequest request) throws JsonProcessingException;

    ResponseEntity<?> getChat() throws JsonProcessingException;
}
