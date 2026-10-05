package com.sattva.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sattva.dto.NotificationsDTO;
import com.sattva.enums.OrderStatus;
import com.sattva.service.NotificationsService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
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

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.ResponseStatus;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private NotificationsService notificationsService;
    private static final double GST_RATE = 0.05; // 5% GST

    @ResponseStatus(HttpStatus.CONFLICT)
    public static class DuplicateInvoiceException extends RuntimeException {
        public DuplicateInvoiceException(String msg) { super(msg); }
    }
    @Transactional
    @Override
    public InvoiceDTO generateInvoice(String supplierId, String orderId, Double deliveryCharge) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // only the owning supplier can fulfill
        if (!order.getSupplier().getId().equals(supplierId)) {
            throw new AccessDeniedException("This order belongs to another supplier");
        }

        // already fulfilled -> stop here
        if (invoiceRepository.existsByOrder_Id(orderId)) {
            throw new DuplicateInvoiceException("Order already fulfilled, invoice exists");
        }

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setOrder(order);            // <-- new
        invoice.setId(UUID.randomUUID().toString());
        invoice.setSupplier(order.getSupplier()); // ✅ use order
        invoice.setRetailer(order.getRetailer());
        invoice.setShop(order.getShop());
        invoice.setInvoiceDate(LocalDateTime.now());
        invoice.setSupplierBusinessName(order.getSupplier().getBusinesses().get(0).getName());

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
//        modelMapper.typeMap(Invoice.class, InvoiceDTO.class).addMappings(m -> {
//            m.map(Invoice::getGrandTotal, InvoiceDTO::setTotalPrice);
//            m.map(src -> src.getRetailer().getRetailerBusinesses().get(0).getName(),
//                    InvoiceDTO::setRetailerBusinessName);
//        });
        // Edge case: no fulfilled items
        if (invoiceOrderItems.isEmpty()) {
            throw new IllegalStateException("No fulfilled items found for this order");
        }

        // Calculate total
//        double total = invoiceOrderItems.stream()
//                .mapToDouble(InvoiceOrderItem::getTotalPrice)
//                .sum();
// Subtotal (fulfilled items only)
        // Subtotal (fulfilled items only)
        double subtotal = invoiceOrderItems.stream()
                .mapToDouble(InvoiceOrderItem::getTotalPrice)
                .sum();

        // GST 5% on the items
        double gstAmount = Math.round(subtotal * GST_RATE * 100.0) / 100.0;

        // Delivery charge (after tax)
        double delivery = deliveryCharge != null ? deliveryCharge : 0.0;
        if (deliveryCharge != null) {
            invoice.setDeliveryCharge(deliveryCharge);
        }

        invoice.setInvoiceOrderItems(invoiceOrderItems);
        invoice.setSubtotal(subtotal);
        invoice.setGstRate(GST_RATE * 100);
        invoice.setGstAmount(gstAmount);
        invoice.setGrandTotal(subtotal + gstAmount + delivery);
        invoice.setStatus(InvoiceStatus.GENERATED);
        invoice.setModifiedUserId(SecurityUtil.getCurrentUserId());
        invoice.setRetailerBusinessName(order.getRetailer().getRetailerBusinesses().get(0).getName());
        // Save
        Invoice saved;
        try {
            saved = invoiceRepository.saveAndFlush(invoice);
        } catch (DataIntegrityViolationException e) {
            // two requests raced; the unique constraint caught the second one
            throw new DuplicateInvoiceException("Order already fulfilled, invoice exists");
        }
        // move the order out of "new/active" in the same transaction
        order.setStatus(OrderStatus.COMPLETED);   // use your real enum value
        orderRepository.save(order);

        InvoiceDTO dto1 = modelMapper.map(saved, InvoiceDTO.class);
        dto1.setTotalPrice(saved.getGrandTotal());
        dto1.setRetailerBusinessName(order.getRetailer().getRetailerBusinesses().get(0).getName());

        NotificationsDTO notificationData = NotificationsDTO.builder()
                .retailerId(order.getRetailer().getId())
                .supplierId(order.getSupplier().getId())
                .orderId(order.getId())
                .invoiceId(invoice.getId())
                .status(order.getStatus())
                .notificationText("Your order has been approved by " + order.getSupplier().getBusinesses().get(0).getName())
                .createdAt(LocalDateTime.now())
                .build();

        notificationsService.createNotifications(notificationData);

        InvoiceDTO dto = modelMapper.map(saved, InvoiceDTO.class);
        dto.setTotalPrice(saved.getGrandTotal());

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
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesForSupplier(String supplierId) {
        List<Invoice> invoices = invoiceRepository.findBySupplier_Id(supplierId);
        return invoices.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private InvoiceDTO toDto(Invoice invoice) {
        InvoiceDTO dto = modelMapper.map(invoice, InvoiceDTO.class);
        dto.setTotalPrice(invoice.getGrandTotal());

        if (invoice.getRetailer() != null
                && invoice.getRetailer().getRetailerBusinesses() != null
                && !invoice.getRetailer().getRetailerBusinesses().isEmpty()) {
            dto.setRetailerBusinessName(
                    invoice.getRetailer().getRetailerBusinesses().get(0).getName());
        }
        return dto;
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
    // InvoiceServiceImpl (add it to the interface too)
    private InvoiceDTO toDetailedDto(Invoice invoice) {
        InvoiceDTO dto = toDto(invoice); // sets totalPrice + retailerBusinessName

        List<InvoiceOrderItem> items = invoice.getInvoiceOrderItems();
        if (items != null && dto.getInvoiceOrderItems() != null) {
            for (int i = 0; i < items.size() && i < dto.getInvoiceOrderItems().size(); i++) {
                OrderItem orderItem = items.get(i).getOrderItem();
                if (orderItem != null && orderItem.getProduct() != null) {
                    dto.getInvoiceOrderItems().get(i)
                            .setProductId(orderItem.getProduct().getProductId());
                    dto.getInvoiceOrderItems().get(i)
                            .setProductName(orderItem.getProduct().getName());
                }
            }
        }
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceByOrderId(String orderId) {
        Invoice invoice = invoiceRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No invoice for order: " + orderId));
        return toDetailedDto(invoice);
    }
}