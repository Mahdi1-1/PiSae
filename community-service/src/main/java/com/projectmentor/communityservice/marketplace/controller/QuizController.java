package com.projectmentor.communityservice.marketplace.controller;

import com.projectmentor.communityservice.marketplace.model.Quiz;
import com.projectmentor.communityservice.marketplace.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/marketplace/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/{quizId}")
    public Quiz getQuiz(@PathVariable String quizId) {
        return quizService.getQuiz(quizId);
    }

    @PostMapping("/{quizId}/submit")
    public Quiz submitQuiz(@PathVariable String quizId, @RequestBody List<Integer> answers) {
        return quizService.submitQuiz(quizId, answers);
    }
}
