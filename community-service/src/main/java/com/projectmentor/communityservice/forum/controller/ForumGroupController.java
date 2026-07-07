package com.projectmentor.communityservice.forum.controller;

import com.projectmentor.communityservice.forum.dto.CreateGroupDTO;
import com.projectmentor.communityservice.forum.model.ForumGroup;
import com.projectmentor.communityservice.forum.service.ForumGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/groups")
@RequiredArgsConstructor
public class ForumGroupController {

    private final ForumGroupService forumGroupService;

    @PostMapping
    public ForumGroup createGroup(@RequestBody CreateGroupDTO dto) {
        return forumGroupService.createGroup(dto);
    }

    @GetMapping
    public List<ForumGroup> getAllGroups() {
        return forumGroupService.getAllGroups();
    }

    @GetMapping("/sector/{sector}")
    public List<ForumGroup> getBySector(@PathVariable String sector) {
        return forumGroupService.getGroupsBySector(sector);
    }

    @PutMapping("/{groupId}/join")
    public ForumGroup joinGroup(
            @PathVariable String groupId,
            @RequestParam String userId) {
        return forumGroupService.joinGroup(groupId, userId);
    }

    @PutMapping("/{groupId}/leave")
    public ForumGroup leaveGroup(
            @PathVariable String groupId,
            @RequestParam String userId) {
        return forumGroupService.leaveGroup(groupId, userId);
    }
}
