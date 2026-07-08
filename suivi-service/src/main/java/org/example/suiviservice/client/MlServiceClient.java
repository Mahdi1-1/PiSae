package org.example.suiviservice.client;

import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import lombok.extern.slf4j.Slf4j;
import org.example.suiviservice.dto.PredictDifficultyRequest;
import org.example.suiviservice.dto.PredictDifficultyResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

// ml-service (FastAPI, Python) n'est pas enregistre dans Eureka : contrairement a UserPiClient
// (Feign + decouverte de service), on l'appelle en WebClient sur une URL fixe configuree via
// ml.service.url. Un appel ML ne doit JAMAIS faire echouer ou ralentir durablement une requete
// utilisateur : toute erreur (timeout, HTTP, service injoignable) est absorbee ici et traduite
// en Optional.empty(), jamais propagee au appelant.
@Component
@Slf4j
public class MlServiceClient {

    private final WebClient webClient;
    private final long timeoutMs;

    public MlServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${ml.service.url}") String baseUrl,
            @Value("${ml.service.timeout-ms}") long timeoutMs) {
        this.timeoutMs = timeoutMs;

        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) timeoutMs)
                .doOnConnected(conn -> conn.addHandlerLast(
                        new ReadTimeoutHandler(timeoutMs, TimeUnit.MILLISECONDS)));

        this.webClient = webClientBuilder
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    /**
     * Predit le niveau de difficulte d'un cours via ml-service.
     * Ne leve jamais d'exception : retourne Optional.empty() en cas d'echec
     * (timeout, erreur HTTP, service injoignable), a charge de l'appelant
     * de definir un comportement de repli.
     */
    public Optional<PredictDifficultyResponse> predictDifficulty(String skills, String description) {
        try {
            PredictDifficultyResponse response = webClient.post()
                    .uri("/predict-difficulty")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(new PredictDifficultyRequest(skills, description))
                    .retrieve()
                    .bodyToMono(PredictDifficultyResponse.class)
                    .timeout(Duration.ofMillis(timeoutMs))
                    .block();
            return Optional.ofNullable(response);
        } catch (WebClientResponseException ex) {
            log.warn("ml-service a repondu une erreur HTTP {} : {}",
                    ex.getStatusCode(), ex.getMessage());
            return Optional.empty();
        } catch (Exception ex) {
            // Mono.timeout(...) enveloppe le TimeoutException dans une exception non-checked
            // au moment du block() : on inspecte donc aussi la cause pour logger un message
            // specifique plutot que de tout regrouper sous "echec inattendu".
            if (isTimeoutOrUnreachable(ex)) {
                log.warn("ml-service injoignable ou timeout depasse ({} ms) : {}",
                        timeoutMs, ex.getMessage());
            } else {
                log.warn("Echec inattendu lors de l'appel a ml-service : {}", ex.getMessage());
            }
            return Optional.empty();
        }
    }

    private boolean isTimeoutOrUnreachable(Throwable ex) {
        Throwable current = ex;
        while (current != null) {
            if (current instanceof TimeoutException || current instanceof WebClientRequestException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
