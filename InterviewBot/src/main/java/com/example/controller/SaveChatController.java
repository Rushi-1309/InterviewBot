package com.example.controller;

import com.example.DTO.GetChatRequest;
import com.example.DTO.SaveChatRequest;
import com.example.services.ChatControllerService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
//@CrossOrigin("*")
public class SaveChatController {

    @Autowired
    private ChatControllerService chatControllerService;

    @PostMapping("/save-chat")
    public ResponseEntity<?> saveChat(@RequestBody SaveChatRequest request) throws JsonProcessingException {
       return chatControllerService.saveChat(request);
    }
    @GetMapping("/get-chat")
    public ResponseEntity<?>getchat() throws JsonProcessingException {
        return chatControllerService.getChat();
    }

}
