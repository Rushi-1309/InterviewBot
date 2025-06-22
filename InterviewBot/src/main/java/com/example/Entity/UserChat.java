package com.example.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userId", nullable = false)
    private Users userId;

    @ManyToOne
    @JoinColumn(name = "chatId", nullable = false)
    private ChatSession chatId;

    public UserChat(Users userId, ChatSession chatId) {
        this.userId = userId;
        this.chatId = chatId;
    }
}
