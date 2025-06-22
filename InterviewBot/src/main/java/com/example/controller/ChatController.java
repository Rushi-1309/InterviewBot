package com.example.controller;

import com.example.services.ChatControllerService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.tomcat.util.http.fileupload.MultipartStream;
import org.aspectj.bridge.Message;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("api/ai")
//@CrossOrigin("*")
public class ChatController {
    @Autowired
    ChatControllerService chatControllerService;

    private ChatClient chatClient;

    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient =chatClientBuilder.build();

    }

    @PostMapping("/upload-resume")
    public ResponseEntity<?> uplaodResume(@RequestParam ("file") MultipartFile file) throws IOException {
        String resumeContent=getTextFormResume(file);
        return chatControllerService.startInterview(resumeContent);
    }
    @PostMapping("/answer-question")
    public ResponseEntity<?>answerQuestion(@RequestBody String answer) {
        return chatControllerService.answerQuestion(answer);
    }


    public String getTextFormResume(MultipartFile file) throws IOException {
        PDDocument document=PDDocument.load(file.getInputStream());
        PDFTextStripper pdfTextStripper = new PDFTextStripper();
        String text = pdfTextStripper.getText(document);
        document.close();
        return text;
    }

}
