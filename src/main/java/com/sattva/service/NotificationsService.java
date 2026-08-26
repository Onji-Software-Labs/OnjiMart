package com.sattva.service;

import com.sattva.dto.NotificationsDTO;

import java.util.List;

public interface NotificationsService {
    void createNotifications(NotificationsDTO notificationData);

    List<NotificationsDTO> getNotifications(String retailerId);
}
