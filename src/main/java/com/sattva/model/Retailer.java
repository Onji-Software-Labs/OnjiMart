package com.sattva.model;


import jakarta.persistence.CascadeType;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.List;


import jakarta.persistence.*;
import lombok.*;
import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "retailers")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Retailer implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private String id;  // Same as User ID

    @OneToOne
    @MapsId
    @JoinColumn(name = "id") // foreign key to 'users.id'
    private User user;

    @OneToMany(mappedBy = "retailer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Shop> shops;
}