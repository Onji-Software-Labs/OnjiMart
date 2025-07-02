package com.sattva.service;

import java.util.List;

import com.sattva.dto.ShopDTO;

public interface ShopService {
    List<ShopDTO> getAllShops();
    ShopDTO getShopById(String shopId);
    List<ShopDTO> getShopsByCity(String city);
    ShopDTO createShop(ShopDTO shopDTO);
    ShopDTO updateShop(String shopId, ShopDTO shopDTO);
    void deleteShop(String shopId);
}
