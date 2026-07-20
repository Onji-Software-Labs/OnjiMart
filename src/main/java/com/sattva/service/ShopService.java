package com.sattva.service;

import java.util.List;

import com.sattva.dto.ShopDTO;
import com.sattva.model.Shop;

public interface ShopService {
    List<ShopDTO> getAllShops();
    ShopDTO getShopById(String shopId);
    List<ShopDTO> getShopsByCity(String city);
    ShopDTO createShop(ShopDTO shopDTO);
    ShopDTO updateShop(String shopId, ShopDTO shopDTO);
    void deleteShop(String shopId);
    List<ShopDTO> getShopsByRetailerId(String retailerId);
    ShopDTO  toDTO (Shop shop);
}
