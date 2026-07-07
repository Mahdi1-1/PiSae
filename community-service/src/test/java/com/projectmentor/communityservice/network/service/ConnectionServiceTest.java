package com.projectmentor.communityservice.network.service;

import com.projectmentor.communityservice.network.model.ConnectionStatus;
import com.projectmentor.communityservice.network.model.MemberConnection;
import com.projectmentor.communityservice.network.repository.ConnectionRepository;
import com.projectmentor.communityservice.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConnectionServiceTest {

    @Mock
    private ConnectionRepository repository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserService userService;

    @InjectMocks
    private ConnectionService connectionService;

    private String requesterId;
    private String targetId;

    @BeforeEach
    void setUp() {
        requesterId = "1";
        targetId = "2";
    }

    @Test
    void shouldSendRequestSuccessfully() {
        when(repository.findByRequesterIdAndTargetId(requesterId, targetId)).thenReturn(Optional.empty());
        when(repository.save(any(MemberConnection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userService.getUserName(1L)).thenReturn("John Doe");

        MemberConnection result = connectionService.sendRequest(requesterId, targetId, "Hello");

        assertNotNull(result);
        assertEquals(requesterId, result.getRequesterId());
        assertEquals(targetId, result.getTargetId());
        assertEquals("Hello", result.getMessage());
        assertEquals(ConnectionStatus.PENDING, result.getStatus());

        verify(repository, times(1)).save(any(MemberConnection.class));
    }

    @Test
    void shouldFailToSendRequestWhenAlreadyExists() {
        MemberConnection existing = MemberConnection.builder()
                .requesterId(requesterId)
                .targetId(targetId)
                .status(ConnectionStatus.PENDING)
                .build();
        when(repository.findByRequesterIdAndTargetId(requesterId, targetId)).thenReturn(Optional.of(existing));

        assertThrows(RuntimeException.class, () -> connectionService.sendRequest(requesterId, targetId, "Hello"));
        verify(repository, never()).save(any(MemberConnection.class));
    }

    @Test
    void shouldAcceptRequestSuccessfully() {
        MemberConnection existing = MemberConnection.builder()
                .id("conn1")
                .requesterId(requesterId)
                .targetId(targetId)
                .status(ConnectionStatus.PENDING)
                .build();

        when(repository.findById("conn1")).thenReturn(Optional.of(existing));
        when(repository.save(any(MemberConnection.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userService.getUserName(2L)).thenReturn("Jane Smith");

        MemberConnection result = connectionService.acceptRequest("conn1");

        assertNotNull(result);
        assertEquals(ConnectionStatus.ACCEPTED, result.getStatus());
        assertNotNull(result.getRespondedAt());
        verify(repository, times(1)).save(existing);
    }

    @Test
    void shouldDeclineRequestSuccessfully() {
        MemberConnection existing = MemberConnection.builder()
                .id("conn1")
                .requesterId(requesterId)
                .targetId(targetId)
                .status(ConnectionStatus.PENDING)
                .build();

        when(repository.findById("conn1")).thenReturn(Optional.of(existing));
        when(repository.save(any(MemberConnection.class))).thenAnswer(inv -> inv.getArgument(0));

        MemberConnection result = connectionService.declineRequest("conn1");

        assertNotNull(result);
        assertEquals(ConnectionStatus.DECLINED, result.getStatus());
        assertNotNull(result.getRespondedAt());
        verify(repository, times(1)).save(existing);
    }

    @Test
    void shouldReturnTrueWhenConnected() {
        MemberConnection connection = MemberConnection.builder()
                .requesterId(requesterId)
                .targetId(targetId)
                .status(ConnectionStatus.ACCEPTED)
                .build();

        when(repository.findByRequesterIdAndTargetId(requesterId, targetId)).thenReturn(Optional.of(connection));

        boolean connected = connectionService.areConnected(requesterId, targetId);

        assertTrue(connected);
    }

    @Test
    void shouldReturnFalseWhenNotConnected() {
        when(repository.findByRequesterIdAndTargetId(requesterId, targetId)).thenReturn(Optional.empty());
        when(repository.findByRequesterIdAndTargetId(targetId, requesterId)).thenReturn(Optional.empty());

        boolean connected = connectionService.areConnected(requesterId, targetId);

        assertFalse(connected);
    }
}
