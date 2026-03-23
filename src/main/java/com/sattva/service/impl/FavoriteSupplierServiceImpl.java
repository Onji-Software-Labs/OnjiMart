package com.sattva.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.FavoriteSupplierDTO;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.FavoriteSupplier;
import com.sattva.model.Supplier;
import com.sattva.repository.FavoriteSupplierRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.FavoriteSupplierService;

@Service
public class FavoriteSupplierServiceImpl implements FavoriteSupplierService {

    @Autowired
    private FavoriteSupplierRepository favoriteSupplierRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Override
    public String addOrRemoveFavorite(String userId, String supplierId){

        // Fetch supplier from database
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier Not Found"));

         // Check if this supplier is already favorited by the user
        Optional<FavoriteSupplier> existFavorite =
                favoriteSupplierRepository.findByUserIdAndSupplier(userId, supplier);

        // If favorite already exists → remove it
        if(existFavorite.isPresent()){
            favoriteSupplierRepository.delete(existFavorite.get());
            return "Removed From Favorites";
        }

        // If favorite does not exist → create a new favorite
        FavoriteSupplier favoriteSupplier = new FavoriteSupplier();
        favoriteSupplier.setUserId(userId);
        favoriteSupplier.setSupplier(supplier);

        favoriteSupplierRepository.save(favoriteSupplier);

        return "Added to Favorites";
    }

    //Fetches and Returns all favorite suppliers for a given user.
    @Override
    public List<FavoriteSupplierDTO> getUserFavorites(String userId) {

        List<FavoriteSupplier> favorites = favoriteSupplierRepository.findByUserId(userId);

        return favorites.stream().map(fav -> {

            Supplier supplier = fav.getSupplier();

            return new FavoriteSupplierDTO(
                    supplier.getId(),
                    supplier.getUser().getFullName(),
                    supplier.getRating()
            );

        }).collect(Collectors.toList());
    }
}