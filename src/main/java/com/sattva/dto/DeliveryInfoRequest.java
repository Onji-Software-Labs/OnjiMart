package com.sattva.dto;
import java.time.LocalDate;
import com.sattva.enums.DeliveryTimeSlot;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;

public class DeliveryInfoRequest {

    @NotNull
    @FutureOrPresent
    private LocalDate deliveryDate;

    @NotNull
    private DeliveryTimeSlot deliveryTimeSlot;

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public DeliveryTimeSlot getDeliveryTimeSlot() {
        return deliveryTimeSlot;
    }

    public void setDeliveryTimeSlot(DeliveryTimeSlot deliveryTimeSlot) {
        this.deliveryTimeSlot = deliveryTimeSlot;
    }
}