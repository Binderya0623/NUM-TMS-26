package com.example.user_detail_register.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_details")
public class UserDetail {

    @Id
    private String id;

    private String sisiId;        
    private String firstName;     
    private String lastName;      
    private String registerNumber;
    private String gender;        
    private int age;              
    private int birthYear;        
    private String university;    
    private int courseYear;       

    private Date createdAt;
    private Date updatedAt;
} 