package com.sattva.config;

import com.sattva.enums.RoleName;
import com.sattva.model.Role;
import com.sattva.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

@Component
public class RoleInitializer {

    @Bean
    public CommandLineRunner run(RoleRepository roleRepository) {
        return args -> {
            // Loop through all RoleName values and save to database if not present
            for (RoleName roleName : RoleName.values()) {
                roleRepository.findByName(roleName).orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    System.out.println("Initialized role: " + roleName);
                    return role;
                });
            }
        };
    }
}
