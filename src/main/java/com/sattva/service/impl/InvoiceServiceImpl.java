package com.sattva.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.InvoiceDTO;
import com.sattva.enums.InvoiceStatus;
import com.sattva.model.Invoice;
import com.sattva.model.InvoiceOrderItem;
import com.sattva.model.Order;
import com.sattva.model.OrderItem;
import com.sattva.model.Supplier;
import com.sattva.repository.InvoiceRepository;
import com.sattva.repository.OrderRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.InvoiceService;
import com.sattva.util.SecurityUtil;

import jakarta.transaction.Transactional;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    @Override
    public InvoiceDTO generateInvoice(String supplierId, String orderId, Double deliveryCharge) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found with ID: " + supplierId));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderId));

        Invoice invoice = new Invoice();
        invoice.setSupplier(supplier);
        invoice.setRetailer(order.getRetailer());
        invoice.setShop(order.getShop());
        invoice.setInvoiceDate(LocalDateTime.now());

        final double[] grandTotal = {0.0}; // Use an array to hold the grand total

        List<InvoiceOrderItem> invoiceOrderItems = order.getItems().stream()
                .filter(OrderItem::isFulfilled)
                .map(orderItem -> {
                    InvoiceOrderItem invoiceOrderItem = new InvoiceOrderItem();
                    invoiceOrderItem.setOrderItem(orderItem);
                    invoiceOrderItem.setUnitPrice(orderItem.getUnitPrice());
                    invoiceOrderItem.setQuantity(orderItem.getFulfilledQuantity());
                    invoiceOrderItem.setTotalPrice(orderItem.getUnitPrice() * orderItem.getFulfilledQuantity());
                    invoiceOrderItem.setInvoice(invoice);

                    // Add each item's total price to the grand total
                    grandTotal[0] += invoiceOrderItem.getTotalPrice();
                    return invoiceOrderItem;
                })
                .collect(Collectors.toList());
 
     // Set the invoice items and delivery charge
        invoice.setInvoiceOrderItems(invoiceOrderItems);
        if (deliveryCharge != null) {
            invoice.setDeliveryCharge(deliveryCharge);
            grandTotal[0] += deliveryCharge; // Add delivery charge to the grand total
        }

        // Set the grand total to the invoice
        invoice.setGrandTotal(grandTotal[0]);
        invoice.setStatus(InvoiceStatus.GENERATED);
        invoice.setModifiedUserId(SecurityUtil.getCurrentUserId()); // Set the current user ID

        invoiceRepository.save(invoice);
        return modelMapper.map(invoice, InvoiceDTO.class);
    }

    @Override
    public List<InvoiceDTO> getInvoicesForSupplier(String supplierId) {
        List<Invoice> invoices = invoiceRepository.findBySupplier_Id(supplierId);
        return invoices.stream()
                .map(invoice -> modelMapper.map(invoice, InvoiceDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO viewInvoice(String invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        return modelMapper.map(invoice, InvoiceDTO.class);
    }
}
