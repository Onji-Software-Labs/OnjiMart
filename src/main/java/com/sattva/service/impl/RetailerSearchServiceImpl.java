package com.sattva.service.impl;

import com.sattva.dto.*;
import com.sattva.exception.InvalidInputException;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.*;
import com.sattva.repository.ProductRepository;
import com.sattva.repository.RetailerRepository;
import com.sattva.repository.RetailerSearchHistoryRepository;
import com.sattva.repository.SupplierBusinessRepository;
import com.sattva.service.RetailerSearchService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RetailerSearchServiceImpl implements RetailerSearchService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SupplierBusinessRepository supplierBusinessRepository;

    @Autowired
    private RetailerSearchHistoryRepository retailerSearchHistoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private RetailerRepository retailerRepository;


    @Override
    public List<RetailerSearchSuggestionDTO> getSuggestions(String keyword) {

        if (keyword == null || keyword.trim().isEmpty()) {
            throw new InvalidInputException("Keyword is empty");
        }

        List<RetailerSearchSuggestionDTO> results = new ArrayList<>();

        List<Product> matchingProducts = productRepository.findTop5ByNameIgnoreCaseContaining(keyword);

        for (Product p : matchingProducts) {
            results.add(new RetailerSearchSuggestionDTO(p.getProductId(), p.getName(), "PRODUCT"));
        }

        List<SupplierBusiness> matchingSuppliers = supplierBusinessRepository.findTop5ByNameIgnoreCaseContaining(keyword);

        for (SupplierBusiness s : matchingSuppliers) {
            results.add(new RetailerSearchSuggestionDTO(s.getId(), s.getName(), "SUPPLIER"));
        }

        return results;
    }

    @Override
    public RetailerSearchHistoryDTO createSearchHistory(RetailerSearchHistoryDTO searchDataDTO) {
        Retailer retailer = retailerRepository.findById(searchDataDTO.getRetailerId())
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + searchDataDTO.getRetailerId()));

        if (searchDataDTO.getSearchText() == null || searchDataDTO.getSearchText().trim().isEmpty()) {
            throw new IllegalArgumentException("Search text is empty");
        }

        if (searchDataDTO.getSearchedId() == null || searchDataDTO.getSearchedId().isEmpty()) {
            throw new IllegalArgumentException("Searched Id is empty");
        }

        if (!searchDataDTO.getType().equals("PRODUCT") && !searchDataDTO.getType().equals("SUPPLIER")) {
            throw new IllegalArgumentException("Type must be PRODUCT or SUPPLIER");
        }

        Optional<RetailerSearchHistory> existing = retailerSearchHistoryRepository
                .findByRetailerIdAndSearchText(searchDataDTO.getRetailerId(), searchDataDTO.getSearchText());

        if (existing.isPresent()) {
            RetailerSearchHistory history = existing.get();
            history.setSearchedAt(LocalDateTime.now());
            RetailerSearchHistory savedHistory = retailerSearchHistoryRepository.save(history);
            return modelMapper.map(savedHistory, RetailerSearchHistoryDTO.class);
        }

        RetailerSearchHistory history = modelMapper.map(searchDataDTO, RetailerSearchHistory.class);
        history.setRetailer(retailer);
        history.setSearchText(searchDataDTO.getSearchText().trim());
        history.setSearchedId(searchDataDTO.getSearchedId());
        history.setType(searchDataDTO.getType());
        history.setSearchedAt(LocalDateTime.now());
        RetailerSearchHistory savedHistory = retailerSearchHistoryRepository.save(history);
        return modelMapper.map(savedHistory, RetailerSearchHistoryDTO.class);

    }

    @Override
    public List<RetailerSearchHistoryDTO> getSearchHistoryList(String retailerId) {
        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + retailerId));

        return retailerSearchHistoryRepository.findTop10ByRetailerIdOrderBySearchedAtDesc(retailerId)
                .stream()
                .map(text -> modelMapper.map(text, RetailerSearchHistoryDTO.class))
                .collect(Collectors.toList());
    }
}
