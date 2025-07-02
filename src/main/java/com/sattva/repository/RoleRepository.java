package com.sattva.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.enums.RoleName;
import com.sattva.model.Role;

public interface RoleRepository extends JpaRepository<Role, String> {
	 Optional<Role> findByName(RoleName name);
}
