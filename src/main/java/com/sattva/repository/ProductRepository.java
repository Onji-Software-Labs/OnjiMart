package com.sattva.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Product;

public interface ProductRepository extends JpaRepository<Product, String> {

    List<Product> findBySubCategory_Id(String subCategoryId);

    // duplicate check using imageUrl (BEST UNIQUE FIELD)
    boolean existsByImageUrl(String imageUrl);

    Optional<Product> findByImageUrl(String imageUrl);

    //Finding all the product based on category
    List<Product> findByCategory_Id(String categoryId);
}