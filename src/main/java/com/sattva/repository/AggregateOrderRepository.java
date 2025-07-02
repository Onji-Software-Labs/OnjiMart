package com.sattva.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.AggregateOrder;
import com.sattva.model.Supplier;

public interface AggregateOrderRepository extends JpaRepository<AggregateOrder, String> {
	Optional<AggregateOrder> findBySupplierAndAggregateDate(Supplier supplier, LocalDate aggregateDate);
	 List<AggregateOrder> findBySupplierIdAndAggregateDate(String supplierId, LocalDate aggregateDate);

}
