package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Product;

public interface ProductRepository extends JpaRepository<Product, String> {
	 List<Product> findBySubCategory_Id(String subCategoryId);
}
