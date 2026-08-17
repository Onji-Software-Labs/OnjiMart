package com.sattva.service;

import com.sattva.dto.RetailerSearchHistoryDTO;
import com.sattva.dto.RetailerSearchSuggestionDTO;

import java.util.List;

public interface RetailerSearchService {
    List<RetailerSearchSuggestionDTO> getSuggestions(String keyword);

    RetailerSearchHistoryDTO createSearchHistory(RetailerSearchHistoryDTO searchData);

    List<RetailerSearchHistoryDTO> getSearchHistoryList(String retailerId);
}
