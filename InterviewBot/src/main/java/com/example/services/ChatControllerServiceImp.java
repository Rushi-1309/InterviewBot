package com.example.services;

import com.example.DTO.GetChatRequest;
import com.example.DTO.RetriveChatResponse;
import com.example.DTO.SaveChatRequest;
import com.example.Entity.ChatSession;
import com.example.Entity.UserChat;
import com.example.Entity.Users;
import com.example.repo.ChatSessionRepo;
import com.example.repo.UserChatRepo;
import com.example.repo.UserRepo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatControllerServiceImp implements ChatControllerService{
    List<org.springframework.ai.chat.messages.Message> conversation;
    String sessionId;
    ChatClient chatClient;
    @Autowired
    UserRepo repo;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ChatSessionRepo chatSessionRepo;

    @Autowired
    UserChatRepo userChatRepo;
    public ChatControllerServiceImp(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
        this.conversation = new ArrayList<>();
    }

    @Override
    public ResponseEntity<?> startInterview(String resumeContent) {
        String systemPrompt = String.format(
                "You are a polite, professional, and highly experienced technical interviewer for a software developer role. 🎯\n\n" +
                        "Below is the candidate's resume:\n\n%s\n\n" +
                        "📌 Follow these interview rules strictly:\n\n" +
                        "1️⃣ Carefully review the resume to identify the candidate’s core technologies, frameworks, tools, and project experiences.\n" +
                        "2️⃣ DO NOT ask general or non-technical questions like 'Tell me about yourself' or 'Introduce yourself'.\n" +
                        "3️⃣ Ask only ONE question at a time, and wait for the candidate’s response before asking the next.\n" +
                        "4️⃣ Start the interview with a very simple technical question about the FIRST relevant skill or technology mentioned in the resume (e.g., Java, Spring Boot, etc.).\n" +
                        "5️⃣ Gradually increase the difficulty level:\n" +
                        "    → BASIC (definitions, fundamentals)\n" +
                        "    → INTERMEDIATE (usage, best practices)\n" +
                        "    → ADVANCED (optimizations, design decisions)\n" +
                        "    → PROJECT/ARCHITECTURE (real-world application)\n" +
                        "6️⃣ If the candidate gives an incorrect, vague, or unrelated answer:\n" +
                        "   - Politely correct them. ✅\n" +
                        "   - Briefly explain the correct concept.\n" +
                        "7️⃣ After each answer:\n" +
                        "   - Rate it from 1 to 10. ⭐️\n" +
                        "   - Give short, constructive feedback.\n" +
                        "8️⃣ Maintain a friendly, encouraging, and professional tone at all times. Be like a thoughtful and real human interviewer.\n\n" +
                        "🚀 Begin the interview now. Start by asking ONE very simple technical question based on the FIRST skill mentioned in the resume.",
                resumeContent
        );



        SystemMessage systemMessage=new SystemMessage(systemPrompt);
        this.conversation.add(systemMessage);
        String response = chatClient.prompt()
                .messages(conversation)
                .call()
                .content();
        conversation.add(new AssistantMessage(response));
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> answerQuestion(String answer) {
        if (conversation.isEmpty()) {
            return ResponseEntity.badRequest().body("No interview session started. Please start an interview first.");
        }
        Message userMessage=new UserMessage(answer);
        this.conversation.add(userMessage);
        String response = chatClient.prompt()
                .messages(conversation)
                .call()
                .content();
        Message assistantMessage = new AssistantMessage(response);
        this.conversation.add(assistantMessage);
        return ResponseEntity.ok(response);

    }

    @Override
    @Transactional
    public ResponseEntity<?> saveChat(SaveChatRequest request) throws JsonProcessingException {
        String jsonContent=objectMapper.writeValueAsString(conversation);
        sessionId= UUID.randomUUID().toString();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users users=repo.findByEmail(username);
        request.setUserId(users.getUserId());
        request.setSessionId(sessionId);
        request.setConversation(jsonContent);

        ChatSession chatSession=new ChatSession(request.getSessionName(),request.getSessionId(),request.getConversation());
       if (chatSessionRepo.save(chatSession) != null){
           userChatRepo.save(new UserChat(users, chatSession));
           return ResponseEntity.ok("Chat saved successfully with session ID: " + sessionId+"With Session Name: "+request.getSessionName());
       }else
         throw new RuntimeException("Failed to save chat session. Please try again later.");
    }

    @Override
    @Transactional
    public ResponseEntity<?> getChat() throws JsonProcessingException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Users users = repo.findByEmail(username);

        List<UserChat> userChats = userChatRepo.findByUserId_UserId(users.getUserId());

        if (userChats.isEmpty()) {
            return ResponseEntity.ok("No chat sessions found for the user.");
        }

        List<RetriveChatResponse> responsesList = new ArrayList<>();

        for (UserChat userChat : userChats) {
            ChatSession session = userChat.getChatId();

            // Convert JSON to List<Map<String, Object>> to avoid abstract class issue
            List<Map<String, Object>> messages = objectMapper.readValue(
                    session.getContent(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
            );

            RetriveChatResponse response = new RetriveChatResponse();
            response.setSessionId(session.getSessionId());
            response.setSessionName(session.getSessionName());
            response.setChatId(session.getChatId());
            response.setConversation(messages);

            responsesList.add(response);
        }

        return ResponseEntity.ok(responsesList);
    }



}
