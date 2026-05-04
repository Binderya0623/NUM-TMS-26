package com.example.user_detail_register.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailDto {
    private String sisiId;          // Auth системийн хэрэглэгчийн нэвтрэх нэр
    private String firstName;       // Нэр
    private String lastName;        // Овог
    private String registerNumber;  // Регистр
    private String university;      // Аль сургууль
    private int courseYear;         // Хэддүгээр курс
    private String phoneNumber;     // Утасны дугаар (ЗөвхөнAuth Service лүү дамжуулахад ашиглана)
    
    // Эдгээр талбарууд регистрээс автоматаар тооцогддог учир өгөгдөл авах шаардлагагүй
    private String gender;          // Хүйс
    private int age;                // Нас
    private int birthYear;          // Төрсөн он
} 