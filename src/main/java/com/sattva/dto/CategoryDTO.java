package com.sattva.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class CategoryDTO {
	 private String id;
	    
	    private String name; 
	    
	    private String description;
	    private List<SubCategoryDTO> subCategories;
}
