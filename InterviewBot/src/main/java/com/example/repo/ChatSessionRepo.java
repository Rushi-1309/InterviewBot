package com.example.repo;

import com.example.Entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatSessionRepo extends JpaRepository<ChatSession, Long> {

}
