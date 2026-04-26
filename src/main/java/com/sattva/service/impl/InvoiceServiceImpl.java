package com.sattva.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sattva.dto.InvoiceDTO;
import com.sattva.enums.InvoiceStatus;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.Invoice;
import com.sattva.model.InvoiceOrderItem;
import com.sattva.model.Order;
import com.sattva.model.OrderItem;
import com.sattva.repository.InvoiceRepository;
import com.sattva.repository.OrderRepository;
import com.sattva.service.InvoiceService;
import com.sattva.util.SecurityUtil;

import jakarta.transaction.Transactional;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    @Override
    public InvoiceDTO generateInvoice(String supplierId, String orderId, Double deliveryCharge) {

        // Fetch order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setSupplier(order.getSupplier()); // ✅ use order
        invoice.setRetailer(order.getRetailer());
        invoice.setShop(order.getShop());
        invoice.setInvoiceDate(LocalDateTime.now());

        // Create invoice items (ONLY fulfilled items)
        List<InvoiceOrderItem> invoiceOrderItems = order.getItems().stream()
                .filter(OrderItem::isFulfilled)
                .map(orderItem -> {
                    InvoiceOrderItem item = new InvoiceOrderItem();
                    item.setOrderItem(orderItem);
                    item.setUnitPrice(orderItem.getUnitPrice());
                    item.setQuantity(orderItem.getFulfilledQuantity());
                    item.setTotalPrice(orderItem.getUnitPrice() * orderItem.getFulfilledQuantity());
                    item.setInvoice(invoice);
                    return item;
                })
                .collect(Collectors.toList());

        // Edge case: no fulfilled items
        if (invoiceOrderItems.isEmpty()) {
            throw new IllegalStateException("No fulfilled items found for this order");
        }

        // Calculate total
        double total = invoiceOrderItems.stream()
                .mapToDouble(InvoiceOrderItem::getTotalPrice)
                .sum();

        // Add delivery charge if present
        if (deliveryCharge != null) {
            invoice.setDeliveryCharge(deliveryCharge);
            total += deliveryCharge;
        }

        // Set final values
        invoice.setInvoiceOrderItems(invoiceOrderItems);
        invoice.setGrandTotal(total);
        invoice.setStatus(InvoiceStatus.GENERATED);
        invoice.setModifiedUserId(SecurityUtil.getCurrentUserId());

        // Save
        invoiceRepository.save(invoice);

        InvoiceDTO dto = modelMapper.map(invoice, InvoiceDTO.class);
        dto.setTotalPrice(invoice.getGrandTotal()); // ✅ fix mapping

            for (int i = 0; i < dto.getInvoiceOrderItems().size(); i++) {
            InvoiceOrderItem invoiceItem = invoiceOrderItems.get(i);
            OrderItem orderItem = invoiceItem.getOrderItem();

            if (orderItem != null && orderItem.getProduct() != null) {
                dto.getInvoiceOrderItems().get(i)
                    .setProductId(orderItem.getProduct().getProductId()); // ⚠️ change if needed
                dto.getInvoiceOrderItems().get(i)
                    .setProductName(orderItem.getProduct().getName());
            }
        }
        return dto;
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
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));
        return modelMapper.map(invoice, InvoiceDTO.class);
    }

    @Override
    public List<InvoiceDTO> getInvoicesForRetailer(String retailerId) {
        List<Invoice> invoices = invoiceRepository.findByRetailer_Id(retailerId);

        return invoices.stream()
                .map(invoice -> modelMapper.map(invoice, InvoiceDTO.class))
                .collect(Collectors.toList());
    }
}