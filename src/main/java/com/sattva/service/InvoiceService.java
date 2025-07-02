package com.sattva.service;

import java.util.List;

import com.sattva.dto.InvoiceDTO;

public interface InvoiceService {
    InvoiceDTO generateInvoice(String supplierId, String orderId, Double deliveryCharge);
    List<InvoiceDTO> getInvoicesForSupplier(String supplierId);
    InvoiceDTO viewInvoice(String invoiceId);
}