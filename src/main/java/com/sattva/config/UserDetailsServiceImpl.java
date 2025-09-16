package com.sattva.config;

import com.sattva.model.User;
import com.sattva.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String input) throws UsernameNotFoundException {
        // Retrieve the user by phoneNumber/email instead of username
        return userRepository.findByEmail(input)
                .or(() -> userRepository.findByPhoneNumber(input))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email/phone number: " + input));
    }
}
