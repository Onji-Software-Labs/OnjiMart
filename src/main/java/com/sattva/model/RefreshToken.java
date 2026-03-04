package com.sattva.model;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import lombok.Data;

@Entity
@Data
public class RefreshToken {

	@Id
	@UuidGenerator
	private String id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne
    @JoinColumn(name = "userId", referencedColumnName = "id")
    private User user;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(name="deviceId",nullable = false)
    private String deviceId;

    @Column(nullable = false)
    private Instant loginDate;
}
