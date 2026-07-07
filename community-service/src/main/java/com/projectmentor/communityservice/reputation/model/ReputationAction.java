package com.projectmentor.communityservice.reputation.model;

public enum ReputationAction {

    POST_CREATED(5),
    COMMENT_ADDED(3),
    POST_LIKED(2),
    RESOURCE_PUBLISHED(20),
    RECOMMENDATION_RECEIVED(15),
    APPLICATION_ACCEPTED(25),
    GROUP_CREATED(10),
    EVENT_ATTENDED(8),
    POST_RESOLVED(15);

    private final int points;

    ReputationAction(int points) {
        this.points = points;
    }

    public int getPoints() {
        return points;
    }
}