package com.sattva.service;

import com.sattva.dto.CreditAccountDTO;

import java.util.List;

public interface CreditService {
    List<CreditAccountDTO> getCreditListForSupplier(String supplierId,  String status);

    CreditAccountDTO createCreditAccount(CreditAccountDTO creditAccountDTO);

    CreditAccountDTO acceptCreditAccount(String supplierId, String creditAccountId);

    CreditAccountDTO declineCreditAccount(String supplierId, String creditAccountId);
}
