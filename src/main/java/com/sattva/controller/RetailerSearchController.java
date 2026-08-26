package com.sattva.controller;

import com.sattva.dto.RetailerSearchHistoryDTO;
import com.sattva.dto.RetailerSearchSuggestionDTO;
import com.sattva.service.RetailerSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/retailerSearch")
@CrossOrigin
public class RetailerSearchController {

    @Autowired
    private RetailerSearchService retailerSearchService;

    @GetMapping("/suggestions")
    public ResponseEntity<List<RetailerSearchSuggestionDTO>> getSuggestion(@RequestParam String keyword) {
        List<RetailerSearchSuggestionDTO> suggestionList = retailerSearchService.getSuggestions(keyword);
        return ResponseEntity.ok(suggestionList);
    }

    @PostMapping("/create")
    public ResponseEntity<RetailerSearchHistoryDTO> createSearchHistory(@RequestBody RetailerSearchHistoryDTO searchDTO) {
        RetailerSearchHistoryDTO storedHistory = retailerSearchService.createSearchHistory(searchDTO);
        return ResponseEntity.ok(storedHistory);
    }

    @GetMapping("/searchHistory")
    public ResponseEntity<List<RetailerSearchHistoryDTO>> getSearchHistory(@RequestParam String retailerId) {
        List<RetailerSearchHistoryDTO> searchHistoryList = retailerSearchService.getSearchHistoryList(retailerId);
        return ResponseEntity.ok(searchHistoryList);
    }

}
