package com.sattva.controller;

import com.sattva.dto.NotificationsDTO;
import com.sattva.service.NotificationsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationsController {

    @Autowired
    private NotificationsService notificationsService;

    @GetMapping("/{retailerId}")
    public ResponseEntity<List<NotificationsDTO>> getNotifications(@PathVariable String retailerId) {
        List<NotificationsDTO> notificationsList = notificationsService.getNotifications(retailerId);
        return ResponseEntity.ok(notificationsList);
    }
}
