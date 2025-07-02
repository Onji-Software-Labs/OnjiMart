package com.sattva.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sattva.model.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    // Fetch all invoices by supplier ID
    List<Invoice> findBySupplier_Id(String supplierId);

    // Fetch all invoices by retailer ID
    List<Invoice> findByRetailer_Id(String retailerId);

    // Fetch all invoices by shop ID
    List<Invoice> findByShop_Id(String shopId);
}