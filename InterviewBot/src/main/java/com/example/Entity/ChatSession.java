package com.example.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class ChatSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long chatId;

    private String sessionName;

    private String sessionId;
    @Lob
    private String content;

    public ChatSession(String sessionName, String sessionId, String content) {
        this.sessionName = sessionName;
        this.sessionId = sessionId;
        this.content = content;
    }
}
