package com.sattva.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.AggregateOrderDTO;
import com.sattva.dto.ProductAggregateDTO;
import com.sattva.dto.ProductPriceRequest;
import com.sattva.model.AggregateOrder;
import com.sattva.model.Order;
import com.sattva.model.OrderItem;
import com.sattva.model.Product;
import com.sattva.model.ProductAggregate;
import com.sattva.model.Supplier;
import com.sattva.repository.AggregateOrderRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.AggregateOrderService;

import jakarta.transaction.Transactional;

@Service
public class AggregateOrderServiceImpl implements AggregateOrderService {

    @Autowired
    private AggregateOrderRepository aggregateOrderRepository;

    @Autowired
    private SupplierRepository supplierRepository; 
    
    @Autowired
    private ModelMapper modelMapper;

    @Transactional 
    @Override
    public void addToAggregate(Order order) {
        LocalDate today = LocalDate.now();
        Supplier supplier = order.getSupplier();

        AggregateOrder aggregateOrder = aggregateOrderRepository
                .findBySupplierAndAggregateDate(supplier, today)
                .orElseGet(() -> {
                    AggregateOrder newAggregate = new AggregateOrder();
                    newAggregate.setSupplier(supplier);
                    newAggregate.setAggregateDate(today);
                    newAggregate.setDateEntered(LocalDateTime.now());
                    return aggregateOrderRepository.save(newAggregate);
                });

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();

            ProductAggregate productAggregate = aggregateOrder.getProductAggregates().stream()
                    .filter(pa -> pa.getProduct().getProductId().equals(product.getProductId()))
                    .findFirst()
                    .orElseGet(() -> {
                        ProductAggregate newProductAggregate = new ProductAggregate();
                        newProductAggregate.setProduct(product);
                        newProductAggregate.setAggregateOrder(aggregateOrder);
                        newProductAggregate.setTotalQuantity(0);
                        aggregateOrder.getProductAggregates().add(newProductAggregate);
                        return newProductAggregate;
                    });

            productAggregate.setTotalQuantity(productAggregate.getTotalQuantity() + item.getRequestedQuantity());
        }

        aggregateOrder.setDateModified(LocalDateTime.now());
        aggregateOrderRepository.save(aggregateOrder);
    }

    @Transactional
    @Override
    public void removeFromAggregate(Order order) {
        LocalDate today = LocalDate.now();
        Supplier supplier = order.getSupplier();

        AggregateOrder aggregateOrder = aggregateOrderRepository
                .findBySupplierAndAggregateDate(supplier, today)
                .orElseThrow(() -> new RuntimeException("Aggregate order not found for supplier: " + supplier.getId()));

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();

            ProductAggregate productAggregate = aggregateOrder.getProductAggregates().stream()
                    .filter(pa -> pa.getProduct().getProductId().equals(product.getProductId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Product aggregate not found for product: " + product.getProductId()));

            productAggregate.setTotalQuantity(productAggregate.getTotalQuantity() - item.getRequestedQuantity());
        }

        aggregateOrder.setDateModified(LocalDateTime.now());
        aggregateOrderRepository.save(aggregateOrder);
    }

    @Transactional
    @Override
    public void clearAggregates(String supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + supplierId));

        LocalDate today = LocalDate.now();
        AggregateOrder aggregateOrder = aggregateOrderRepository.findBySupplierAndAggregateDate(supplier, today)
                .orElseThrow(() -> new RuntimeException("Aggregate order not found for today"));

        for (ProductAggregate productAggregate : aggregateOrder.getProductAggregates()) {
            productAggregate.setTotalQuantity(0); // Reset the total quantity for each product
        }

        aggregateOrder.setDateModified(LocalDateTime.now());
        aggregateOrderRepository.save(aggregateOrder);
    }


    @Override
    public List<AggregateOrderDTO> getAggregateOrdersForSupplierAndDate(String supplierId, LocalDate date) {
        List<AggregateOrder> aggregateOrders = aggregateOrderRepository.findBySupplierIdAndAggregateDate(supplierId, date);
        return aggregateOrders.stream()
                .map(aggregateOrder -> modelMapper.map(aggregateOrder, AggregateOrderDTO.class))
                .collect(Collectors.toList());
    }
    
   
    @Override
    public void markAggregateOrderAsCompleted(String aggregateOrderId, List<ProductPriceRequest> productPrices) {
        AggregateOrder aggregateOrder = aggregateOrderRepository.findById(aggregateOrderId)
                .orElseThrow(() -> new RuntimeException("Aggregate order not found with ID: " + aggregateOrderId));

        // Set the aggregate order as completed
        aggregateOrder.setCompleted(true);
        aggregateOrder.setDateModified(LocalDateTime.now()); // Corrected to LocalDateTime to include both date and time

        Set<ProductAggregate> productAggregates = new HashSet<>(aggregateOrder.getProductAggregates()); // Convert List to Set

        // Update the unit price for each product aggregate based on the request
        for (ProductPriceRequest priceRequest : productPrices) {
            productAggregates.stream()
                    .filter(pa -> pa.getProduct().getProductId().equals(priceRequest.getProductId()))
                    .findFirst()
                    .ifPresent(productAggregate -> {
                        productAggregate.setUnitPrice(priceRequest.getUnitPrice());
                        
                    });
        }

        // Save the aggregate order with the updated unit prices
        aggregateOrderRepository.save(aggregateOrder);
    }

	@Override
	public ProductAggregateDTO updateProductUnitPrice(String aggregateOrderId, String productId, double unitPrice) {
	       // Step 1: Find the aggregate order by ID
        AggregateOrder aggregateOrder = aggregateOrderRepository.findById(aggregateOrderId)
                .orElseThrow(() -> new RuntimeException("Aggregate order not found with ID: " + aggregateOrderId));

        // Step 2: Find the relevant product aggregate
        ProductAggregate productAggregate = aggregateOrder.getProductAggregates().stream()
                .filter(pa -> pa.getProduct().getProductId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product aggregate not found for product ID: " + productId));

        // Step 3: Update the unit price for the product aggregate
        productAggregate.setUnitPrice(unitPrice);

        // Step 4: Update the modified date and save the aggregate order
        aggregateOrder.setDateModified(LocalDateTime.now());
        aggregateOrderRepository.save(aggregateOrder);

        // Step 5: Return the updated product aggregate as DTO
        return modelMapper.map(productAggregate, ProductAggregateDTO.class);
	}

}