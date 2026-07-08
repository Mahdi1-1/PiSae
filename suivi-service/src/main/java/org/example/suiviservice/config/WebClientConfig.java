package org.example.suiviservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// suivi-service utilise spring-boot-starter-webmvc (Tomcat servlet) ; l'auto-configuration
// de WebClient.Builder ne s'active pas dans ce contexte, on la declare donc explicitement
// pour MlServiceClient (seul consommateur de WebClient dans ce module pour l'instant).
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }
}
