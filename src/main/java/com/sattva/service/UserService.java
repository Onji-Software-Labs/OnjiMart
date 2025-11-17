package com.sattva.service;

import com.sattva.dto.CreateUserDTO;
import com.sattva.dto.UserDTO;
import java.util.List;
import java.util.UUID;

public interface UserService {
	 CreateUserDTO createUser(CreateUserDTO userDto);

    UserDTO getUserById(String userId);

    List<UserDTO> getAllUsers();

    UserDTO updateUser(String userId, UserDTO userDTO);

    void deleteUser(String userId);
    
    public boolean logoutUser(String refreshToken);
}
