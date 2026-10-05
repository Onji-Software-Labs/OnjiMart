package com.sattva.repository;

import com.sattva.model.CreditAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CreditRepository extends JpaRepository<CreditAccount, String> {
    List<CreditAccount> findBySupplierIdAndStatus(String supplierId, String status);

    Optional<CreditAccount> findByIdAndSupplierId(String supplierId, String creditAccountId);


}
