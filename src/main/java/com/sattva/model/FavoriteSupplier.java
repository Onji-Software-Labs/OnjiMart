package com.sattva.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "favorite_suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteSupplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private String userId;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;  
}