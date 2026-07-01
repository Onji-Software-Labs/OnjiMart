package com.sattva.dto;

import java.util.List;

import lombok.Data;

@Data
public class EditOrderRequestDTO {

    private List<EditOrderItemRequestDTO> items;
}