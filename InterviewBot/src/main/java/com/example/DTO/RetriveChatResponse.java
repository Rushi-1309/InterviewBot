package com.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.ai.chat.messages.Message;

import java.util.List;
import java.util.Map;

@Data
public class RetriveChatResponse {
    private Long chatId;
    private String sessionId;
    private String sessionName;
    private List<Map<String, Object>> conversation;
}

