package com.sattva.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
public class Category {

    @Id
    @UuidGenerator
    private String id;
    
    private String name; 
    
    private String description; 
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubCategory> subCategories = new ArrayList<>();

    @ManyToMany(mappedBy = "categories")
    private Set<Supplier> suppliers; 
}