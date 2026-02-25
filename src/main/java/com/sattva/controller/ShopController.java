package com.sattva.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sattva.dto.ShopDTO;
import com.sattva.service.ShopService;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin
public class ShopController {

    @Autowired
    private ShopService shopService;

    @GetMapping("/AllShop")
    public ResponseEntity<List<ShopDTO>> getAllShops() {
        List<ShopDTO> shops = shopService.getAllShops();
        return ResponseEntity.ok(shops);
    }

    @GetMapping("/getById/{shopId}")
    public ResponseEntity<ShopDTO> getShopById(@PathVariable String shopId) {
        ShopDTO shop = shopService.getShopById(shopId);
        return ResponseEntity.ok(shop);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<ShopDTO>> getShopsByCity(@PathVariable String city) {
        List<ShopDTO> shops = shopService.getShopsByCity(city);
        return ResponseEntity.ok(shops);
    }
    @PreAuthorize("hasRole('ROLE_RETAILER')")
    @PostMapping("/create")
    public ResponseEntity<ShopDTO> createShop(@RequestBody ShopDTO shopDTO) {
        ShopDTO createdShop = shopService.createShop(shopDTO);
        return new ResponseEntity<>(createdShop, HttpStatus.CREATED);
    }

    @PutMapping("/update/{shopId}")
    public ResponseEntity<ShopDTO> updateShop(@PathVariable String shopId, @RequestBody ShopDTO shopDTO) {
        ShopDTO updatedShop = shopService.updateShop(shopId, shopDTO);
        return ResponseEntity.ok(updatedShop);
    }

    @DeleteMapping("/delete/{shopId}")
    public ResponseEntity<Void> deleteShop(@PathVariable String shopId) {
        shopService.deleteShop(shopId);
        return ResponseEntity.noContent().build();
    }
}
