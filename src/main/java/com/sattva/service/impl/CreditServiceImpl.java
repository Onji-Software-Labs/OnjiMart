package com.sattva.service.impl;

import com.sattva.dto.CreditAccountDTO;
import com.sattva.exception.ResourceNotFoundException;
import com.sattva.model.*;
import com.sattva.repository.CreditRepository;
import com.sattva.repository.RetailerRepository;
import com.sattva.repository.SupplierRepository;
import com.sattva.service.CreditService;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditServiceImpl implements CreditService {

    @Autowired
    private CreditRepository creditRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RetailerRepository retailerRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    @Transactional
    public List<CreditAccountDTO> getCreditListForSupplier(String supplierId,  String status) {

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));

        if(status == null || status.isEmpty()) {
            throw new IllegalArgumentException("No status provided");
        }

        List<CreditAccount> creditListForSupplier = creditRepository.findBySupplierIdAndStatus(supplierId, status);

        return creditListForSupplier.stream()
                .map(this::convertToCreditAccountDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CreditAccountDTO createCreditAccount(CreditAccountDTO creditAccountDTO) {
        Retailer retailer = retailerRepository.findById(creditAccountDTO.getRetailerId())
                .orElseThrow(() -> new ResourceNotFoundException("Retailer not found with id: " + creditAccountDTO.getRetailerId()));

        Supplier supplier = supplierRepository.findById(creditAccountDTO.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + creditAccountDTO.getSupplierId()));

        CreditAccount creditAccount = new CreditAccount();
        creditAccount.setSupplier(supplier);
        creditAccount.setRetailer(retailer);
        creditAccount.setRetailerName(creditAccountDTO.getRetailerName());
        creditAccount.setRetailerAddress(creditAccountDTO.getRetailerAddress());
        creditAccount.setStatus(creditAccountDTO.getStatus());
        creditAccount.setReliability(creditAccountDTO.getReliability());
        creditAccount.setTotalOwed(creditAccountDTO.getTotalOwed());
        creditAccount.setRepaymentScore(creditAccountDTO.getRepaymentScore());
        creditAccount.setDurationOfMonths(creditAccountDTO.getDurationOfMonths());
        creditAccount.setTotalInstallments(creditAccountDTO.getTotalInstallments());
        creditAccount.setTotalPaid(creditAccountDTO.getTotalPaid());
        creditAccount.setCreatedAt(LocalDateTime.now());
        creditAccount.setUpdatedAt(LocalDateTime.now());

        creditRepository.save(creditAccount);

        return modelMapper.map(creditAccount, CreditAccountDTO.class);
    }

    @Override
    @Transactional
    public CreditAccountDTO acceptCreditAccount(String supplierId, String creditAccountId) {

        CreditAccount existingCreditAccount = creditRepository.findByIdAndSupplierId(creditAccountId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit account " + creditAccountId + " not found for supplier " + supplierId));

        if(!existingCreditAccount.getStatus().equals("NEW")) {
            throw new IllegalArgumentException("Only NEW accounts can be accepted");
        }

        existingCreditAccount.setStatus("ONGOING");
        existingCreditAccount.setUpdatedAt(LocalDateTime.now());

        creditRepository.save(existingCreditAccount);

        return convertToCreditAccountDTO(existingCreditAccount);
    }

    @Override
    @Transactional
    public CreditAccountDTO declineCreditAccount(String supplierId, String creditAccountId) {

        CreditAccount existingCreditAccount = creditRepository.findByIdAndSupplierId(creditAccountId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit account " + creditAccountId + " not found for supplier " + supplierId));

        if(!existingCreditAccount.getStatus().equals("NEW")) {
            throw new IllegalArgumentException("Only NEW accounts can be accepted");
        }

        existingCreditAccount.setStatus("DECLINED");
        existingCreditAccount.setUpdatedAt(LocalDateTime.now());

        creditRepository.save(existingCreditAccount);

        return convertToCreditAccountDTO(existingCreditAccount);
    }

    private CreditAccountDTO convertToCreditAccountDTO(CreditAccount creditAccount) {
        return modelMapper.map(creditAccount, CreditAccountDTO.class);
    }
}
