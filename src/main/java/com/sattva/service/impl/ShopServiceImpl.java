package com.sattva.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.ShopDTO;
import com.sattva.model.Retailer;
import com.sattva.model.Shop;
import com.sattva.repository.RetailerRepository;
import com.sattva.repository.ShopRepository;
import com.sattva.service.ShopService;

@Service
public class ShopServiceImpl implements ShopService {

    @Autowired
    private ShopRepository shopRepository;

    @Autowired
    private RetailerRepository retailerRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<ShopDTO> getAllShops() {
        return shopRepository.findAll()
                .stream()
                .map(shop -> modelMapper.map(shop, ShopDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ShopDTO getShopById(String shopId) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));
        return modelMapper.map(shop, ShopDTO.class);
    }

    @Override
    public List<ShopDTO> getShopsByCity(String city) {
        return shopRepository.findByCity(city)
                .stream()
                .map(shop -> modelMapper.map(shop, ShopDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ShopDTO createShop(ShopDTO shopDTO) {
        Retailer retailer = retailerRepository.findById(shopDTO.getRetailerId())
                .orElseThrow(() -> new RuntimeException("Retailer not found with id: " + shopDTO.getRetailerId()));

        Shop shop = modelMapper.map(shopDTO, Shop.class);
        shop.setId(UUID.randomUUID().toString()); // Generate a unique ID for the new shop
        shop.setRetailer(retailer);

        Shop savedShop = shopRepository.save(shop);
        return modelMapper.map(savedShop, ShopDTO.class);
    }

    @Override
    public ShopDTO updateShop(String shopId, ShopDTO shopDTO) {
        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found with id: " + shopId));

        shop.setName(shopDTO.getName());
        shop.setStreet(shopDTO.getStreet());
        shop.setCity(shopDTO.getCity());
        shop.setState(shopDTO.getState());
        shop.setPincode(shopDTO.getPincode());
        shop.setCountry(shopDTO.getCountry());
        
        shop.setLatitude(shopDTO.getLatitude());
        shop.setLongitude(shopDTO.getLongitude());
        shop.setContactNumber(shopDTO.getContactNumber());
        shop.setOpeningHours(shopDTO.getOpeningHours());
        shop.setActive(shopDTO.isActive());

        Shop updatedShop = shopRepository.save(shop);
        return modelMapper.map(updatedShop, ShopDTO.class);
    }

    @Override
    public void deleteShop(String shopId) {
        shopRepository.deleteById(shopId);
    }
}
