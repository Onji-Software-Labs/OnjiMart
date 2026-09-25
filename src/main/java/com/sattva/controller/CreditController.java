package com.sattva.controller;

import com.sattva.dto.CreditAccountDTO;
import com.sattva.service.CreditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credit")
@CrossOrigin
public class CreditController {

    @Autowired
    private CreditService creditService;

    @GetMapping("/{supplierId}/{status}")
    public ResponseEntity<List<CreditAccountDTO>> getCreditListForSupplier(@PathVariable String supplierId, @PathVariable String status) {
        List<CreditAccountDTO> creditList = creditService.getCreditListForSupplier(supplierId, status);
        return ResponseEntity.ok(creditList);
    }

    @PostMapping("/submit")
    public ResponseEntity<CreditAccountDTO> submitCredit(@RequestBody CreditAccountDTO creditAccountDTO) {
        CreditAccountDTO creditAccount = creditService.createCreditAccount(creditAccountDTO);
        return new ResponseEntity<>(creditAccount, HttpStatus.CREATED);
    }

    @PostMapping("/{supplierId}/{creditId}/accept")
    public ResponseEntity<CreditAccountDTO> acceptCredit(@PathVariable String supplierId, @PathVariable String creditId) {
        CreditAccountDTO acceptCreditAccount = creditService.acceptCreditAccount(supplierId, creditId);
        return new ResponseEntity<>(acceptCreditAccount, HttpStatus.OK);
    }

    @PostMapping("/{supplierId}/{creditId}/decline")
    public ResponseEntity<CreditAccountDTO> declineCredit(@PathVariable String supplierId, @PathVariable String creditId) {
        CreditAccountDTO declinedCreditAccount = creditService.declineCreditAccount(supplierId, creditId);
        return new ResponseEntity<>(declinedCreditAccount, HttpStatus.OK);

    }
}
