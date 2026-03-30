package com.sattva.service;

import java.util.List;
import com.sattva.dto.FavoriteSupplierDTO;

public interface FavoriteSupplierService {

    String addOrRemoveFavorite(String userId, String supplierId);

    List<FavoriteSupplierDTO> getUserFavorites(String userId);

}