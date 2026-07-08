package org.example.apigateway.config;

import org.example.apigateway.filter.AuthFilter;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration
public class GatewayRoutes {

    private final AuthFilter authFilter;

    public GatewayRoutes(AuthFilter authFilter) {
        this.authFilter = authFilter;
    }

    @Bean
    public RouterFunction<ServerResponse> userAuthRoute() {
        return RouterFunctions
                .route(path("/api/auth/**"), HandlerFunctions.http())
                .filter(lb("user-pi"))
                .filter(authFilter.jwtFilter());
    }

    @Bean
    public RouterFunction<ServerResponse> userServiceRoute() {
        return RouterFunctions
                .route(path("/api/users/**"), HandlerFunctions.http())
                .filter(lb("user-pi"))
                .filter(authFilter.jwtFilter());
    }

    @Bean
    public RouterFunction<ServerResponse> oauth2Route() {
        return RouterFunctions
                .route(path("/login/oauth2/**").or(path("/oauth2/**")),
                        HandlerFunctions.http())
                .filter(lb("user-pi"));
    }

    @Bean
    public RouterFunction<ServerResponse> communityServiceRoute() {
        return RouterFunctions
                .route(path("/api/community/**"), HandlerFunctions.http())
                .filter(lb("community-service"))
                .filter(authFilter.jwtFilter());
    }

    @Bean
    public RouterFunction<ServerResponse> suiviServiceRoute() {
        return RouterFunctions
                .route(path("/api/progression/**")
                                .or(path("/api/avis/**"))
                                .or(path("/api/logs/**"))
                                .or(path("/api/recommendation/**")),
                        HandlerFunctions.http())
                .filter(lb("suivi-service"))
                .filter(authFilter.jwtFilter());
    }
}
