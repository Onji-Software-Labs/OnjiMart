package com.sattva.repository;

import com.sattva.model.RetailerSearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RetailerSearchHistoryRepository extends JpaRepository<RetailerSearchHistory, String> {
    Optional<RetailerSearchHistory> findByRetailerIdAndSearchText(String retailerId, String searchText);

    List<RetailerSearchHistory> findTop10ByRetailerIdOrderBySearchedAtDesc(String retailerId);
}
