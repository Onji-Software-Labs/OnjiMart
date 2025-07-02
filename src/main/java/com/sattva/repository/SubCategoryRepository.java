package com.sattva.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.SubCategory;

public interface SubCategoryRepository extends JpaRepository<SubCategory, String> {
}