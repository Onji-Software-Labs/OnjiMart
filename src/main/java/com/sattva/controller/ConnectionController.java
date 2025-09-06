package com.sattva.controller;

import com.sattva.model.Connection;
import com.sattva.service.impl.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {

    @Autowired
    private ConnectionService service;

    @PostMapping("/connect")
    public Connection connect(@RequestParam String retailerId, @RequestParam String supplierId) {
        return service.connect(retailerId, supplierId);
    }

    @DeleteMapping("/cancel")
    public void cancel(@RequestParam String retailerId, @RequestParam String supplierId) {
        service.cancel(retailerId, supplierId);
    }

    @GetMapping("/status")
    public Optional<Connection> status(@RequestParam String retailerId, @RequestParam String supplierId) {
        return service.getStatus(retailerId, supplierId);
    }

    // Endpoint to accept a connection request (from supplier side)
    @PostMapping("/accept")
    public ResponseEntity<Connection> accept(@RequestParam String retailerId, @RequestParam String supplierId) {
        return service.accept(retailerId, supplierId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint to reject a connection request (from supplier side)
    @PostMapping("/reject")
    public ResponseEntity<Connection> rejectConnection(@RequestParam String retailerId, @RequestParam String supplierId){
       return service.rejectConnection(retailerId, supplierId)
               .map(ResponseEntity::ok)
               .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
