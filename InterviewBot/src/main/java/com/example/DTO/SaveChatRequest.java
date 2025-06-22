package com.example.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.ai.chat.messages.Message;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaveChatRequest {
   private String sessionName;
   private String sessionId;
   private Long userId;
   private String conversation;
}
