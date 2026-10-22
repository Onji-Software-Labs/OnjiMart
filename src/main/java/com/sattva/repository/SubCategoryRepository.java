package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.SubCategory;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {

    List<SubCategory> findByCategory_Id(String categoryId);
    
}