package com.example.repo;

import com.example.Entity.ChatSession;
import com.example.Entity.UserChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserChatRepo extends JpaRepository<UserChat,Long> {
    List<UserChat> findByUserId_UserId(Long userId);
}
