package com.sattva.service.impl;

import com.sattva.dto.NotificationsDTO;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.*;
import com.sattva.repository.*;
import com.sattva.service.NotificationsService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationsServiceImpl implements NotificationsService {

    @Autowired
    private RetailerRepository retailerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private NotificationsRepository notificationsRepository;

    @Override
    public void createNotifications(NotificationsDTO notificationData) {
        Retailer retailer = retailerRepository.findById(notificationData.getRetailerId())
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + notificationData.getRetailerId()));

        Supplier supplier = supplierRepository.findById(notificationData.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + notificationData.getSupplierId()));

        Order order = orderRepository.findById(notificationData.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + notificationData.getOrderId()));

        Invoice invoice = invoiceRepository.findById(notificationData.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + notificationData.getInvoiceId()));

        Notifications notification = new Notifications();
        notification.setRetailer(retailer);
        notification.setSupplier(supplier);
        notification.setOrder(order);
        notification.setInvoice(invoice);
        notification.setStatus(notificationData.getStatus());
        notification.setNotificationText(notificationData.getNotificationText());
        notification.setCreatedAt(LocalDateTime.now());
        notificationsRepository.save(notification);
        modelMapper.map(notification, NotificationsDTO.class);
    }

    @Override
    public List<NotificationsDTO> getNotifications(String retailerId) {
        Retailer retailer = retailerRepository.findById(retailerId)
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + retailerId));

        return notificationsRepository.findByRetailerIdOrderByCreatedAtDesc(retailerId)
                .stream()
                .map(notification -> modelMapper.map(notification, NotificationsDTO.class))
                .collect(Collectors.toList());
    }
}
