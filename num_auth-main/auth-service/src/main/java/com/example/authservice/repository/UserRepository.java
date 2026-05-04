package com.example.authservice.repository;

import com.example.authservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findBySisiId(String sisiId);
    boolean existsBySisiId(String sisiId);
} 
