package com.example.user_detail_register.repository;

import com.example.user_detail_register.model.UserDetail;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserDetailRepository extends MongoRepository<UserDetail, String> {
    Optional<UserDetail> findBySisiId(String sisiId);
    Optional<UserDetail> findByRegisterNumber(String registerNumber);
    boolean existsBySisiId(String sisiId);
    boolean existsByRegisterNumber(String registerNumber);
} 