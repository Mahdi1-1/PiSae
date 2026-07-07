package com.projectmentor.communityservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI communityServiceAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Community Service API")
                        .description("Module Communauté & Réseau — Project Mentor")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Project Mentor Team")
                                .email("contact@projectmentor.tn")));
    }
}