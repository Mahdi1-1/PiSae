package org.example.suiviservice.client;

import org.example.suiviservice.dto.ApprenantSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// "user-pi" = spring.application.name de userPI, résolu via Eureka (même convention que
// GatewayRoutes.java côté api-gateway qui utilise lb("user-pi")).
@FeignClient(name = "user-pi")
public interface UserPiClient {

    @GetMapping("/api/users/{id}")
    ApprenantSummaryDto getApprenantById(@PathVariable("id") Long id);
}
