package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.sattva.dto.FavoriteSupplierDTO;
import com.sattva.service.FavoriteSupplierService;

@RestController
@RequestMapping("/favorites")
@CrossOrigin
public class FavoriteSupplierController {

    @Autowired
    private FavoriteSupplierService favoriteSupplierService;

    // Add or remove supplier from favorites
    @PostMapping("/{userId}/{supplierId}")
    public ResponseEntity<String> addOrRemoveFavorite(
            @PathVariable String userId,
            @PathVariable String supplierId) {

        String response = favoriteSupplierService.addOrRemoveFavorite(userId, supplierId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // Get all favorite suppliers of user
    @GetMapping("/{userId}")
    public ResponseEntity<List<FavoriteSupplierDTO>> getUserFavorites(@PathVariable String userId) {

        List<FavoriteSupplierDTO> favorites = favoriteSupplierService.getUserFavorites(userId);

        return new ResponseEntity<>(favorites, HttpStatus.OK);
    }
}