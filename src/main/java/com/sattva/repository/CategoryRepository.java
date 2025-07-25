package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByNameIn(List<String> names);
}
