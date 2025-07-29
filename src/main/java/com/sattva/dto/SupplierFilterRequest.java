package com.sattva.dto;

import java.util.List;

public class SupplierFilterRequest {
    private List<String> categoryNames;

    private String pincodeFilter;

    private Double rating;

    // Getter and Setter
    public List<String> getCategoryNames() {
        return categoryNames;
    }

    public void setCategoryNames(List<String> categoryNames) {
        this.categoryNames = categoryNames;
    }

    public String getPincodeFilter() {
        return pincodeFilter;
    }

    public void setPincodeFilter(String pincodeFilter) {
        this.pincodeFilter = pincodeFilter;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }
}
