package com.sattva.service;

import java.time.LocalDate;
import java.util.List;

import com.sattva.dto.AggregateOrderDTO;
import com.sattva.dto.ProductAggregateDTO;
import com.sattva.dto.ProductPriceRequest;
import com.sattva.model.Order;

public interface AggregateOrderService {
    void addToAggregate(Order order);
    void removeFromAggregate(Order order);
    void clearAggregates(String supplierId);
    List<AggregateOrderDTO> getAggregateOrdersForSupplierAndDate(String supplierId, LocalDate date);
     void markAggregateOrderAsCompleted(String aggregateOrderId, List<ProductPriceRequest> productPrices);
     ProductAggregateDTO updateProductUnitPrice(String aggregateOrderId, String productId, double unitPrice);
}