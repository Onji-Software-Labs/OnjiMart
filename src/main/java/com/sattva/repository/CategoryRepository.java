package com.sattva.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Category;

public interface CategoryRepository extends JpaRepository<Category, String> {
    List<Category> findByNameIn(List<String> names);

     boolean existsByNameIgnoreCase(String name);

    Optional<Category> findByNameIgnoreCase(String name);

    List<Category> findAllByNameIgnoreCase(String name);
}
