package com.projectmentor.communityservice.marketplace.service;

import com.projectmentor.communityservice.marketplace.model.Opportunity;
import com.projectmentor.communityservice.marketplace.model.OpportunityApplication;
import com.projectmentor.communityservice.marketplace.model.OpportunityStatus;
import com.projectmentor.communityservice.marketplace.repository.ApplicationRepository;
import com.projectmentor.communityservice.marketplace.repository.OpportunityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final MarketplaceService marketplaceService;
    private final OpportunityRepository opportunityRepository;
    private final ApplicationRepository applicationRepository;
    private final FileStorageService fileStorageService;
    private final CandidateMLService candidateMLService;

    /**
     * Get top recommended opportunities for a user based on their CV
     * Uses advanced matching algorithm combining skills, experience, and user profile
     */
    public List<Opportunity> getRecommendedOpportunitiesForUser(String userId, String cvUrl) {
        log.info("Generating opportunity recommendations for user: {}", userId);
        
        // Get all available opportunities
        List<Opportunity> allOpportunities = opportunityRepository.findByStatusAndDeletedFalse(OpportunityStatus.OPEN);
        
        // Extract CV content and analyze
        CvAnalysis cvAnalysis = analyzeCv(cvUrl);
        
        // Score each opportunity based on CV match
        List<ScoredOpportunity> scoredOpportunities = allOpportunities.stream()
                .map(opp -> new ScoredOpportunity(opp, calculateOpportunityScore(cvAnalysis, opp)))
                .filter(scored -> scored.getScore() > 0.3) // Only show opportunities with decent match
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .collect(Collectors.toList());
        
        // Return top 10 recommendations
        return scoredOpportunities.stream()
                .limit(10)
                .map(ScoredOpportunity::getOpportunity)
                .collect(Collectors.toList());
    }

    /**
     * Analyze CV content to extract skills, experience, and qualifications
     */
    private CvAnalysis analyzeCv(String cvUrl) {
        String cvText = fileStorageService.extractTextFromCv(cvUrl);
        if (cvText == null || cvText.isBlank()) {
            return new CvAnalysis(new ArrayList<>(), 0, new ArrayList<>());
        }

        String lowerText = cvText.toLowerCase();
        
        // Extract skills from CV text
        List<String> detectedSkills = extractSkillsFromText(lowerText);
        
        // Estimate experience level
        int experienceYears = estimateExperienceYears(lowerText);
        
        // Extract education level
        List<String> education = extractEducation(lowerText);
        
        return new CvAnalysis(detectedSkills, experienceYears, education);
    }
    
    /**
     * Extract skills from CV text using keyword matching
     */
    private List<String> extractSkillsFromText(String text) {
        // Common tech skills to look for
        String[] techSkills = {
            "java", "python", "javascript", "typescript", "react", "angular", "vue", "node.js", "spring", 
            "hibernate", "docker", "kubernetes", "aws", "azure", "gcp", "mongodb", "mysql", "postgresql",
            "git", "jenkins", "maven", "gradle", "linux", "windows", "android", "ios", "swift", "kotlin",
            "html", "css", "sass", "bootstrap", "tailwind", "redux", "graphql", "rest", "microservices",
            "agile", "scrum", "kanban", "ci/cd", "devops", "testing", "junit", "selenium", "cypress"
        };
        
        return Arrays.stream(techSkills)
                .filter(skill -> text.contains(skill))
                .collect(Collectors.toList());
    }
    
    /**
     * Estimate years of experience from CV text
     */
    private int estimateExperienceYears(String text) {
        // Look for experience indicators
        int years = 0;
        
        // Count years mentioned
        for (int i = 1; i <= 20; i++) {
            if (text.contains(i + " year") || text.contains(i + " ans") || text.contains(i + "+")) {
                years = Math.max(years, i);
            }
        }
        
        // Senior keywords indicate more experience
        if (text.contains("senior") || text.contains("lead") || text.contains("architect")) {
            years = Math.max(years, 5);
        }
        
        // Junior keywords indicate less experience
        if (text.contains("junior") || text.contains("intern") || text.contains("student")) {
            years = Math.min(years, 2);
        }
        
        return Math.max(0, years);
    }
    
    /**
     * Extract education information
     */
    private List<String> extractEducation(String text) {
        List<String> education = new ArrayList<>();
        
        String[] educationKeywords = {
            "bachelor", "master", "phd", "doctorate", "licence", "ingenieur", "baccalaureate",
            "computer science", "software engineering", "informatics", "telecom", "electrical"
        };
        
        for (String keyword : educationKeywords) {
            if (text.contains(keyword)) {
                education.add(keyword);
            }
        }
        
        return education;
    }
    
    /**
     * Calculate compatibility score between CV analysis and opportunity
     */
    private double calculateOpportunityScore(CvAnalysis cvAnalysis, Opportunity opportunity) {
        double skillsScore = calculateSkillsCompatibility(cvAnalysis.getSkills(), opportunity) * 0.5;
        double experienceScore = calculateExperienceCompatibility(cvAnalysis.getExperienceYears(), opportunity) * 0.3;
        double educationScore = calculateEducationCompatibility(cvAnalysis.getEducation(), opportunity) * 0.2;
        
        double totalScore = skillsScore + experienceScore + educationScore;
        
        log.debug("Opportunity {} scored {} for CV (skills: {}, exp: {}, edu: {})", 
                opportunity.getId(), totalScore, skillsScore, experienceScore, educationScore);
        
        return totalScore;
    }
    
    /**
     * Calculate skills compatibility score
     */
    private double calculateSkillsCompatibility(List<String> cvSkills, Opportunity opportunity) {
        List<String> requiredSkills = opportunity.getSkillsRequired();
        
        if (requiredSkills.isEmpty()) {
            return 0.5; // Neutral score if no skills specified
        }
        
        if (cvSkills.isEmpty()) {
            return 0.0; // No skills detected in CV
        }
        
        // Count matching skills
        long matchingSkills = cvSkills.stream()
                .filter(cvSkill -> requiredSkills.stream()
                        .anyMatch(reqSkill -> reqSkill.toLowerCase().contains(cvSkill) || 
                                               cvSkill.contains(reqSkill.toLowerCase())))
                .count();
        
        // Calculate match ratio
        double matchRatio = (double) matchingSkills / requiredSkills.size();
        
        // Bonus for having more skills than required
        double skillDensity = Math.min(1.0, (double) cvSkills.size() / requiredSkills.size());
        
        return Math.min(1.0, matchRatio * 0.8 + skillDensity * 0.2);
    }
    
    /**
     * Calculate experience compatibility score
     */
    private double calculateExperienceCompatibility(int cvExperience, Opportunity opportunity) {
        // This is a simplified scoring - in production, you'd have experience requirements per opportunity
        // For now, assume opportunities need 0-2 years for junior, 3-5 for mid, 6+ for senior
        
        String title = opportunity.getTitle().toLowerCase();
        String description = opportunity.getDescription().toLowerCase();
        
        int requiredExperience = 0;
        
        // Estimate required experience from job title and description
        if (title.contains("senior") || title.contains("lead") || title.contains("architect") ||
            description.contains("senior") || description.contains("experienced")) {
            requiredExperience = 5;
        } else if (title.contains("junior") || title.contains("intern") || title.contains("trainee") ||
                   description.contains("junior") || description.contains("entry")) {
            requiredExperience = 1;
        } else {
            requiredExperience = 3; // Mid-level default
        }
        
        // Score based on experience match
        if (cvExperience >= requiredExperience) {
            return Math.min(1.0, 0.5 + (cvExperience - requiredExperience) * 0.1);
        } else {
            return Math.max(0.0, 0.8 - (requiredExperience - cvExperience) * 0.2);
        }
    }
    
    /**
     * Calculate education compatibility score
     */
    private double calculateEducationCompatibility(List<String> cvEducation, Opportunity opportunity) {
        if (cvEducation.isEmpty()) {
            return 0.5; // Neutral if no education detected
        }
        
        // Check for relevant education keywords
        boolean hasRelevantEducation = cvEducation.stream()
                .anyMatch(edu -> {
                    String lowerEdu = edu.toLowerCase();
                    return lowerEdu.contains("computer") || lowerEdu.contains("software") || 
                           lowerEdu.contains("engineering") || lowerEdu.contains("informatics") ||
                           lowerEdu.contains("telecom") || lowerEdu.contains("electrical");
                });
        
        return hasRelevantEducation ? 1.0 : 0.7;
    }

    /**
     * Calculate skills matching score between application and opportunity
     */
    private double calculateSkillsMatch(OpportunityApplication application, Opportunity opportunity) {
        List<String> requiredSkills = opportunity.getSkillsRequired();
        String coverLetter = application.getCoverLetter().toLowerCase();
        
        if (requiredSkills.isEmpty()) {
            return 0.5; // Default score if no skills specified
        }

        // Count how many required skills are mentioned in cover letter
        long matchedSkills = requiredSkills.stream()
                .filter(skill -> coverLetter.contains(skill.toLowerCase()))
                .count();

        return (double) matchedSkills / requiredSkills.size();
    }

    /**
     * Get top candidates for an opportunity based on ML-powered scoring (limit = positionsAvailable * 3)
     */
    public List<OpportunityApplication> getTopCandidates(String opportunityId) {
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new RuntimeException("Opportunity not found: " + opportunityId));
        
        int limit = Math.max(3, opportunity.getPositionsAvailable() * 3);
        return getTopCandidates(opportunityId, limit);
    }

    /**
     * Get top candidates for an opportunity based on ML-powered scoring with specific limit
     */
    public List<OpportunityApplication> getTopCandidates(String opportunityId, int limit) {
        log.info("Finding top candidates for opportunity: {} using ML model", opportunityId);

        // Get the opportunity
        Opportunity opportunity = opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new RuntimeException("Opportunity not found: " + opportunityId));

        // Get all applications for this opportunity
        List<OpportunityApplication> applications = marketplaceService.getApplicationsForOpportunity(opportunityId);

        // Score each application using the ML model
        List<ScoredApplication> scoredApplications = applications.stream()
                .map(app -> {
                    double score = candidateMLService.scoreCandidate(app, opportunity);
                    // Save individual scores (CV and Cover Letter) to the database
                    applicationRepository.save(app);
                    log.debug("Candidate {} scored {} for opportunity {}", app.getId(), score, opportunityId);
                    return new ScoredApplication(app, score);
                })
                .sorted((a, b) -> Double.compare(b.getScore(), a.getScore()))
                .collect(Collectors.toList());

        log.info("Ranked {} candidates for opportunity {} (scoring mode: {})",
                scoredApplications.size(), opportunityId, candidateMLService.getScoringMode());

        // Return top candidates (AI-recommended)
        return scoredApplications.stream()
                .limit(limit)
                .map(ScoredApplication::getApplication)
                .collect(Collectors.toList());
    }

    /**
     * Calculate cover letter quality score
     * Based on length, structure, and keyword analysis
     */
    private double calculateCoverLetterScore(OpportunityApplication application) {
        String coverLetter = application.getCoverLetter();
        
        if (coverLetter == null || coverLetter.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;
        
        // Length score (optimal between 100-500 words)
        int wordCount = coverLetter.split("\\s+").length;
        if (wordCount >= 100 && wordCount <= 500) {
            score += 0.4;
        } else if (wordCount >= 50) {
            score += 0.2;
        }

        // Professional keywords
        String[] professionalKeywords = {"experience", "skills", "project", "team", "develop", "create", "implement"};
        String lowerCoverLetter = coverLetter.toLowerCase();
        long keywordCount = Arrays.stream(professionalKeywords)
                .filter(lowerCoverLetter::contains)
                .count();
        score += (keywordCount * 0.1);

        // Structure indicators
        if (coverLetter.contains("Dear") || coverLetter.contains("Hello")) score += 0.1;
        if (coverLetter.contains("Sincerely") || coverLetter.contains("Best regards")) score += 0.1;

        return Math.min(score, 1.0);
    }

    /**
     * Calculate resume text quality score based on extracted PDF content
     * This measures skill mentions, relevant keywords and resume length
     */
    private double calculateResumeTextScore(OpportunityApplication application, Opportunity opportunity) {
        String resumeText = fileStorageService.extractTextFromCv(application.getCvUrl());
        if (resumeText == null || resumeText.isBlank()) {
            return 0.0;
        }

        String lowerText = resumeText.toLowerCase();
        List<String> requiredSkills = opportunity.getSkillsRequired();
        double skillMatch = 0.5;
        if (!requiredSkills.isEmpty()) {
            long matchedSkills = requiredSkills.stream()
                    .filter(skill -> lowerText.contains(skill.toLowerCase()))
                    .count();
            skillMatch = (double) matchedSkills / requiredSkills.size();
        }

        String[] resumeKeywords = {"experience", "project", "team", "develop", "manage", "design", "build", "implemented", "analysis", "lead"};
        long keywordCount = Arrays.stream(resumeKeywords)
                .filter(lowerText::contains)
                .count();
        double keywordScore = Math.min((double) keywordCount / resumeKeywords.length, 1.0);

        int wordCount = lowerText.split("\\s+").length;
        double lengthScore = Math.min(1.0, Math.max(0.2, Math.min(1.0, wordCount / 1200.0)));

        return Math.min(1.0, skillMatch * 0.6 + keywordScore * 0.3 + lengthScore * 0.1);
    }

    private double calculateTimingScore(OpportunityApplication application) {
        // Simple scoring: earlier applications get higher scores
        // This could be enhanced with business logic
        return 0.8; // Default timing score
    }

    /**
     * Get opportunity by ID
     */
    private Opportunity getOpportunityById(String opportunityId) {
        return opportunityRepository.findById(opportunityId)
                .orElseThrow(() -> new RuntimeException("Opportunity not found"));
    }

    /**
     * Helper class to hold application with its score
     */
    private static class ScoredApplication {
        private final OpportunityApplication application;
        private final double score;

        public ScoredApplication(OpportunityApplication application, double score) {
            this.application = application;
            this.score = score;
        }

        public OpportunityApplication getApplication() {
            return application;
        }

        public double getScore() {
            return score;
        }
    }
    
    /**
     * Helper class to hold opportunity with its recommendation score
     */
    private static class ScoredOpportunity {
        private final Opportunity opportunity;
        private final double score;

        public ScoredOpportunity(Opportunity opportunity, double score) {
            this.opportunity = opportunity;
            this.score = score;
        }

        public Opportunity getOpportunity() {
            return opportunity;
        }

        public double getScore() {
            return score;
        }
    }
    
    /**
     * Data class to hold CV analysis results
     */
    private static class CvAnalysis {
        private final List<String> skills;
        private final int experienceYears;
        private final List<String> education;

        public CvAnalysis(List<String> skills, int experienceYears, List<String> education) {
            this.skills = skills;
            this.experienceYears = experienceYears;
            this.education = education;
        }

        public List<String> getSkills() { return skills; }
        public int getExperienceYears() { return experienceYears; }
        public List<String> getEducation() { return education; }
    }
}
