package com.example.user_detail_register.service;

import com.example.user_detail_register.model.UserDetail;
import com.example.user_detail_register.repository.UserDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailService {

    private final UserDetailRepository userDetailRepository;

    public UserDetail createUserDetail(UserDetail userDetail) {
        processRegisterNumberData(userDetail);
        
        userDetail.setCreatedAt(new Date());
        userDetail.setUpdatedAt(new Date());
        
        return userDetailRepository.save(userDetail);
    }
    
    public Optional<UserDetail> getUserDetailBySisiId(String sisiId) {
        return userDetailRepository.findBySisiId(sisiId);
    }
    
    public Optional<UserDetail> getUserDetailByRegisterNumber(String registerNumber) {
        return userDetailRepository.findByRegisterNumber(registerNumber);
    }
    
    public UserDetail updateUserDetail(String id, UserDetail updatedUserDetail) {
        return userDetailRepository.findById(id)
                .map(existingUserDetail -> {
                    // Шинэчлэх боломжтой талбаруудыг шинэчлэх
                    if (updatedUserDetail.getFirstName() != null) {
                        existingUserDetail.setFirstName(updatedUserDetail.getFirstName());
                    }
                    if (updatedUserDetail.getLastName() != null) {
                        existingUserDetail.setLastName(updatedUserDetail.getLastName());
                    }
                    if (updatedUserDetail.getRegisterNumber() != null) {
                        existingUserDetail.setRegisterNumber(updatedUserDetail.getRegisterNumber());
                        // Регистр өөрчлөгдсөн бол нас хүйс дахин тооцох
                        processRegisterNumberData(existingUserDetail);
                    }
                    if (updatedUserDetail.getUniversity() != null) {
                        existingUserDetail.setUniversity(updatedUserDetail.getUniversity());
                    }
                    if (updatedUserDetail.getCourseYear() > 0) {
                        existingUserDetail.setCourseYear(updatedUserDetail.getCourseYear());
                    }
                    
                    existingUserDetail.setUpdatedAt(new Date());
                    return userDetailRepository.save(existingUserDetail);
                })
                .orElseThrow(() -> new RuntimeException("Хэрэглэгч олдсонгүй: " + id));
    }
    
    // Регистр дугаараас нас хүйс тооцоолох функц
    private void processRegisterNumberData(UserDetail userDetail) {
        String registerNumber = userDetail.getRegisterNumber();
        if (registerNumber != null && registerNumber.length() >= 10) {
            // Регистрийн формат: XX00000000, эхний 2 тоо нь төрсөн он (XX)
            String yearCode = registerNumber.substring(2, 4);
            int birthYear;
            
            // Төрсөн он тооцоолох
            if (Integer.parseInt(yearCode) >= 0 && Integer.parseInt(yearCode) <= 30) {
                birthYear = 2000 + Integer.parseInt(yearCode);
            } else {
                birthYear = 1900 + Integer.parseInt(yearCode);
            }
            
            userDetail.setBirthYear(birthYear);
            
            // Одоогийн нас тооцоолох
            int currentYear = LocalDate.now().getYear();
            userDetail.setAge(currentYear - birthYear);
            
            // Хүйс тооцоолох - сүүлээс 2 дахь орон тэгш бол эмэгтэй, сондгой бол эрэгтэй
            char genderDigit = registerNumber.charAt(8); // 10 оронтой бол 8 дахь индекс
            int genderValue = Character.getNumericValue(genderDigit);
            
            // Тэгш бол эмэгтэй, сондгой бол эрэгтэй
            userDetail.setGender(genderValue % 2 == 0 ? "Эмэгтэй" : "Эрэгтэй");
        }
    }
} 