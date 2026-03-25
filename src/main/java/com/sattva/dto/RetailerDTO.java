package com.sattva.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerDTO {

    private String id;
    private String fullName;
    private String email;
    private String pincode;
    private List<String> categoryIds;
}
