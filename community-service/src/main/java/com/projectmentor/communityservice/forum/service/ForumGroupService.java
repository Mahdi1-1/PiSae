package com.projectmentor.communityservice.forum.service;

import com.projectmentor.communityservice.forum.dto.CreateGroupDTO;
import com.projectmentor.communityservice.forum.model.ForumGroup;
import com.projectmentor.communityservice.forum.model.GroupStatus;
import com.projectmentor.communityservice.forum.model.GroupVisibility;
import com.projectmentor.communityservice.forum.repository.ForumGroupRepository;
import com.projectmentor.communityservice.reputation.service.ReputationService;
import com.projectmentor.communityservice.reputation.model.ReputationAction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumGroupService {

    private final ForumGroupRepository repository;
    private final ReputationService reputationService;

    // Créer un groupe
    public ForumGroup createGroup(CreateGroupDTO dto) {
        ForumGroup group = ForumGroup.builder()
                .name(dto.getName())
                .sector(dto.getSector())
                .description(dto.getDescription())
                .createdBy(dto.getCreatedBy())
                .visibility(GroupVisibility.valueOf(dto.getVisibility()))
                .adminIds(new ArrayList<>(List.of(dto.getCreatedBy())))
                .memberIds(new ArrayList<>(List.of(dto.getCreatedBy())))
                .memberCount(1)
                .status(GroupStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
        
        ForumGroup saved = repository.save(group);

        // Reputation Reward
        if (saved.getCreatedBy() != null) {
            reputationService.addPoints(saved.getCreatedBy(), ReputationAction.GROUP_CREATED);
        }

        return saved;
    }

    // Rejoindre un groupe
    public ForumGroup joinGroup(String groupId, String userId) {
        ForumGroup group = repository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!group.getMemberIds().contains(userId)) {
            group.getMemberIds().add(userId);
            group.setMemberCount(group.getMemberCount() + 1);
        }
        return repository.save(group);
    }

    // Quitter un groupe
    public ForumGroup leaveGroup(String groupId, String userId) {
        ForumGroup group = repository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        group.getMemberIds().remove(userId);
        group.setMemberCount(group.getMemberCount() - 1);
        return repository.save(group);
    }

    // Récupérer tous les groupes
    public List<ForumGroup> getAllGroups() {
        return repository.findAll();
    }

    // Récupérer par secteur
    public List<ForumGroup> getGroupsBySector(String sector) {
        return repository.findBySector(sector);
    }
}