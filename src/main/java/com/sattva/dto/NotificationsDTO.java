package com.sattva.dto;

import com.sattva.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
@Builder
public class NotificationsDTO {
    private String id;
    private String retailerId;
    private String supplierId;
    private String orderId;
    private String invoiceId;
    private OrderStatus status;
    private String notificationText;
    private LocalDateTime createdAt;
}
