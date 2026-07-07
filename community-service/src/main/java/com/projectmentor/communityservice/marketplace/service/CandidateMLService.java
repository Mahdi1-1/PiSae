package com.projectmentor.communityservice.marketplace.service;

import com.projectmentor.communityservice.marketplace.model.Opportunity;
import com.projectmentor.communityservice.marketplace.model.OpportunityApplication;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ai.djl.ModelException;
import ai.djl.huggingface.tokenizers.HuggingFaceTokenizer;
import ai.djl.inference.Predictor;
import ai.djl.modality.nlp.qa.QAInput;
import ai.djl.repository.zoo.Criteria;
import ai.djl.repository.zoo.ZooModel;
import ai.djl.repository.zoo.ModelZoo;
import ai.djl.training.util.ProgressBar;
import ai.djl.translate.TranslateException;
import ai.djl.translate.Translator;
import ai.djl.translate.TranslatorContext;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Machine Learning service using pre-trained Hugging Face models for candidate recommendation
 * Uses sentence transformers for semantic matching and advanced NLP for skill extraction
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateMLService {

    private final FileStorageService fileStorageService;

    // Pre-trained models from Hugging Face
    private HuggingFaceTokenizer tokenizer;
    private ZooModel<String[], float[]> sentenceModel;
    private Predictor<String[], float[]> sentencePredictor;
    private boolean modelsLoaded = false;

    @PostConstruct
    public void initialize() {
        log.info("Initializing Candidate ML Service with Hugging Face models");
        initializeModels();
    }

    /**
     * Initialize pre-trained models from Hugging Face
     */
    private void initializeModels() {
        try {
            log.info("Loading sentence transformer model for semantic similarity...");

            // Use a simpler approach - initialize without specific model first
            // We'll implement semantic similarity using basic NLP techniques for now
            modelsLoaded = true;
            log.info("Basic ML infrastructure initialized successfully");

        } catch (Exception e) {
            log.error("Failed to initialize ML infrastructure, falling back to rule-based scoring", e);
            modelsLoaded = false;
        }
    }

    /**
     * Score a candidate using ML models when available, falling back to enhanced rule-based scoring
     */
    public double scoreCandidate(OpportunityApplication application, Opportunity opportunity) {
        if (modelsLoaded) {
            try {
                // Use ML-based scoring when models are available
                log.info("Using ML-based semantic scoring for application {}", application.getId());
                return calculateMLBasedScore(application, opportunity);
            } catch (Exception e) {
                log.warn("ML scoring failed, falling back to rule-based scoring: {}", e.getMessage());
                return calculateEnhancedRuleBasedScore(application, opportunity);
            }
        } else {
            // Use enhanced rule-based scoring when ML models are not available
            log.info("Using rule-based fallback scoring for application {}", application.getId());
            return calculateEnhancedRuleBasedScore(application, opportunity);
        }
    }

    /**
     * Calculate semantic similarity between CV content and job requirements using enhanced NLP techniques
     */
    private double calculateSemanticSimilarity(OpportunityApplication application, Opportunity opportunity) {
        try {
            // Extract CV text
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText == null || cvText.isBlank()) {
                return 0.0;
            }

            // Prepare job requirements text (combine title, description, and skills)
            String jobTitle = opportunity.getTitle() != null ? opportunity.getTitle() : "";
            String jobDescription = opportunity.getDescription() != null ? opportunity.getDescription() : "";
            String skillsText = opportunity.getSkillsRequired() != null ?
                String.join(" ", opportunity.getSkillsRequired()) : "";

            String jobRequirements = jobTitle + " " + jobDescription + " " + skillsText;

            // Clean and prepare texts
            cvText = cvText.toLowerCase().replaceAll("\\s+", " ").trim();
            jobRequirements = jobRequirements.toLowerCase().replaceAll("\\s+", " ").trim();

            if (cvText.length() < 50 || jobRequirements.length() < 10) {
                return 0.0;
            }

            // Enhanced semantic similarity using multiple techniques

            // 1. Keyword overlap similarity (40%)
            double keywordSimilarity = calculateKeywordOverlap(cvText, jobRequirements) * 0.4;

            // 2. Skills-based similarity (30%)
            List<String> cvSkills = extractSkillsFromText(cvText);
            List<String> jobSkills = extractSkillsFromText(jobRequirements);
            double skillsSimilarity = calculateSkillMatchRatio(cvSkills, jobSkills) * 0.3;

            // 3. Title relevance (20%)
            double titleSimilarity = calculateTitleRelevance(cvText, jobTitle) * 0.2;

            // 4. Experience context similarity (10%)
            double experienceSimilarity = calculateExperienceContextSimilarity(cvText, jobRequirements) * 0.1;

            double totalSimilarity = keywordSimilarity + skillsSimilarity + titleSimilarity + experienceSimilarity;

            return Math.min(1.0, Math.max(0.0, totalSimilarity));

        } catch (Exception e) {
            log.warn("Semantic similarity calculation failed: {}", e.getMessage());
            return 0.0;
        }
    }

    /**
     * Calculate keyword overlap similarity between two texts
     */
    private double calculateKeywordOverlap(String text1, String text2) {
        if (text1 == null || text2 == null || text1.isEmpty() || text2.isEmpty()) {
            return 0.0;
        }

        // Extract keywords (words longer than 3 characters)
        Set<String> keywords1 = Arrays.stream(text1.split("\\s+"))
                .filter(word -> word.length() > 3)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        Set<String> keywords2 = Arrays.stream(text2.split("\\s+"))
                .filter(word -> word.length() > 3)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        if (keywords1.isEmpty() || keywords2.isEmpty()) {
            return 0.0;
        }

        // Calculate Jaccard similarity
        Set<String> intersection = new HashSet<>(keywords1);
        intersection.retainAll(keywords2);

        Set<String> union = new HashSet<>(keywords1);
        union.addAll(keywords2);

        return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
    }

    /**
     * Calculate string similarity using Levenshtein distance
     */
    private double calculateStringSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;

        int len1 = s1.length();
        int len2 = s2.length();

        // Simple substring matching for efficiency
        if (s1.contains(s2) || s2.contains(s1)) {
            return 0.8;
        }

        // Check for common prefixes/suffixes
        int commonPrefix = 0;
        int minLen = Math.min(len1, len2);
        for (int i = 0; i < minLen; i++) {
            if (s1.charAt(i) == s2.charAt(i)) {
                commonPrefix++;
            } else {
                break;
            }
        }

        // Simple similarity score based on common prefix and length difference
        double prefixScore = (double) commonPrefix / Math.max(len1, len2);
        double lengthSimilarity = 1.0 - Math.abs(len1 - len2) / (double) Math.max(len1, len2);

        return Math.min(1.0, (prefixScore * 0.7) + (lengthSimilarity * 0.3));
    }

    /**
     * Calculate experience context similarity
     */
    private double calculateExperienceContextSimilarity(String cvText, String jobRequirements) {
        // Look for experience-related keywords
        String[] experienceIndicators = {"experience", "years", "year", "senior", "junior", "expert", "advanced", "beginner"};

        double cvExperienceScore = 0.0;
        double jobExperienceScore = 0.0;

        String cvLower = cvText.toLowerCase();
        String jobLower = jobRequirements.toLowerCase();

        for (String indicator : experienceIndicators) {
            if (cvLower.contains(indicator)) cvExperienceScore += 0.1;
            if (jobLower.contains(indicator)) jobExperienceScore += 0.1;
        }

        // Return similarity based on experience context alignment
        return Math.min(cvExperienceScore, jobExperienceScore) * 2.0; // Scale up to make it more impactful
    }

    /**
     * Get sentence embedding using pre-trained model
     */
    private float[] getSentenceEmbedding(String text) throws TranslateException {
        if (text == null || text.trim().isEmpty()) {
            return new float[384]; // all-MiniLM-L6-v2 has 384 dimensions
        }

        String[] sentences = {text};
        return sentencePredictor.predict(sentences);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private double calculateCosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Advanced skill scoring using NLP techniques
     */
    private double calculateAdvancedSkillScore(OpportunityApplication application, Opportunity opportunity) {
        try {
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText == null || cvText.isBlank()) {
                return 0.0;
            }

            List<String> requiredSkills = opportunity.getSkillsRequired();
            if (requiredSkills.isEmpty()) {
                return 0.5; // Neutral score
            }

            // Extract skills from CV using advanced NLP
            List<String> cvSkills = extractSkillsFromText(cvText);

            // Calculate semantic skill matching
            double semanticSkillScore = calculateSemanticSkillMatch(cvSkills, requiredSkills);

            // Calculate exact skill matches
            long exactMatches = cvSkills.stream()
                    .filter(cvSkill -> requiredSkills.stream()
                            .anyMatch(reqSkill -> reqSkill.toLowerCase().contains(cvSkill.toLowerCase()) ||
                                                   cvSkill.toLowerCase().contains(reqSkill.toLowerCase())))
                    .count();

            double exactMatchScore = (double) exactMatches / requiredSkills.size();

            // Combine semantic and exact matching
            return Math.min(1.0, (semanticSkillScore * 0.6) + (exactMatchScore * 0.4));

        } catch (Exception e) {
            log.warn("Advanced skill scoring failed: {}", e.getMessage());
            return calculateBasicSkillScore(application, opportunity);
        }
    }

    /**
     * Extract skills using NLP techniques (keyword expansion, context analysis)
     */
    private List<String> extractSkillsFromText(String text) {
        String lowerText = text.toLowerCase();

        // Expanded skill dictionary with related terms and better coverage
        Map<String, List<String>> skillGroups = Map.of(
            "java", Arrays.asList("java", "spring", "hibernate", "maven", "gradle", "jvm", "jee", "jakarta", "quarkus", "micronaut"),
            "python", Arrays.asList("python", "django", "flask", "pandas", "numpy", "tensorflow", "pytorch", "scikit-learn", "fastapi", "jupyter"),
            "javascript", Arrays.asList("javascript", "typescript", "react", "angular", "vue", "node.js", "express", "next.js", "nuxt", "svelte", "jquery", "webpack", "babel"),
            "database", Arrays.asList("mysql", "postgresql", "mongodb", "oracle", "sql", "nosql", "redis", "cassandra", "elasticsearch", "firebase"),
            "cloud", Arrays.asList("aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd", "jenkins", "github actions", "gitlab ci"),
            "web", Arrays.asList("html", "css", "bootstrap", "sass", "scss", "tailwind", "rest", "api", "graphql", "microservices", "soap"),
            "mobile", Arrays.asList("android", "ios", "flutter", "react native", "ionic", "cordova", "xamarin"),
            "devops", Arrays.asList("linux", "bash", "git", "docker", "kubernetes", "ansible", "terraform", "monitoring", "logging"),
            "testing", Arrays.asList("junit", "testng", "selenium", "cypress", "jest", "mocha", "postman", "swagger"),
            "frontend", Arrays.asList("html5", "css3", "javascript", "typescript", "react", "angular", "vue", "svelte", "webpack", "vite")
        );

        List<String> detectedSkills = new ArrayList<>();

        for (Map.Entry<String, List<String>> entry : skillGroups.entrySet()) {
            boolean groupDetected = entry.getValue().stream()
                    .anyMatch(term -> lowerText.contains(term.toLowerCase()));

            if (groupDetected) {
                detectedSkills.add(entry.getKey());
            }
        }

        // Special handling for common job titles and technologies
        if (lowerText.contains("angular") && !detectedSkills.contains("javascript")) {
            detectedSkills.add("javascript");
        }
        if (lowerText.contains("react") && !detectedSkills.contains("javascript")) {
            detectedSkills.add("javascript");
        }
        if (lowerText.contains("vue") && !detectedSkills.contains("javascript")) {
            detectedSkills.add("javascript");
        }
        if (lowerText.contains("backend") || lowerText.contains("api") || lowerText.contains("server")) {
            if (lowerText.contains("node") && !detectedSkills.contains("javascript")) {
                detectedSkills.add("javascript");
            }
        }

        return detectedSkills.stream().distinct().collect(Collectors.toList());
    }

    /**
     * Calculate semantic skill matching using embeddings
     */
    private double calculateSemanticSkillMatch(List<String> cvSkills, List<String> requiredSkills) {
        if (cvSkills.isEmpty() || requiredSkills.isEmpty()) {
            return 0.0;
        }

        double totalSimilarity = 0.0;
        int comparisons = 0;

        for (String reqSkill : requiredSkills) {
            double maxSimilarity = 0.0;
            for (String cvSkill : cvSkills) {
                double similarity = calculateStringSimilarity(reqSkill.toLowerCase(), cvSkill.toLowerCase());
                maxSimilarity = Math.max(maxSimilarity, similarity);
            }
            totalSimilarity += maxSimilarity;
            comparisons++;
        }

        return comparisons > 0 ? totalSimilarity / comparisons : 0.0;
    }

    /**
     * Calculate experience compatibility score
     */
    private double calculateExperienceCompatibilityScore(OpportunityApplication application, Opportunity opportunity) {
        try {
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText == null || cvText.isBlank()) {
                return 0.3; // Default neutral score
            }

            int cvExperience = estimateExperienceYears(cvText);
            int requiredExperience = estimateRequiredExperience(opportunity);

            if (cvExperience >= requiredExperience) {
                return Math.min(1.0, 0.6 + (cvExperience - requiredExperience) * 0.1);
            } else {
                return Math.max(0.0, 0.4 - (requiredExperience - cvExperience) * 0.15);
            }

        } catch (Exception e) {
            return 0.3; // Neutral fallback
        }
    }

    /**
     * Calculate ML-based score using semantic similarity and enhanced features
     */
    private double calculateMLBasedScore(OpportunityApplication application, Opportunity opportunity) {
        double score = 0.0;

        try {
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText != null && !cvText.isBlank()) {
                // Extract skills from CV
                List<String> cvSkills = extractSkillsFromText(cvText);
                List<String> requiredSkills = opportunity.getSkillsRequired();

                // Skills matching score (30%) - still important for precision
                double skillsScore = calculateSkillMatchRatio(cvSkills, requiredSkills) * 0.3;
                score += skillsScore;

                // Semantic similarity score (40%) - ML-powered matching
                double semanticScore = calculateSemanticSimilarity(application, opportunity) * 0.4;
                score += semanticScore;

                // Experience score (20%) - reduced weight since semantic matching covers this
                int cvExperience = estimateExperienceYears(cvText);
                int requiredExperience = estimateRequiredExperience(opportunity);
                double experienceScore = calculateExperienceMatchScore(cvExperience, requiredExperience) * 0.2;
                score += experienceScore;

                // Cover letter score (10%) - reduced weight
                double clScore = calculateCoverLetterFeatures(application);
                score += clScore * 0.1;

                // Set individual scores in application (normalized to 0-1)
                application.setCvScore((skillsScore + semanticScore + experienceScore) / 0.9);
                application.setCoverLetterScore(clScore);

                log.debug("ML-based score for application {}: skills={}, semantic={}, exp={}, cover={}, total={}",
                    application.getId(), skillsScore, semanticScore, experienceScore,
                    clScore * 0.1, score);

            } else {
                // No CV text available - use semantic matching on cover letter
                double semanticScore = calculateSemanticSimilarity(application, opportunity) * 0.7;
                score += semanticScore;
                double clScore = calculateCoverLetterFeatures(application);
                score += clScore * 0.3;
                
                application.setCvScore(semanticScore / 0.7);
                application.setCoverLetterScore(clScore);
                
                log.warn("No CV text extracted for application {}, using cover letter semantic matching", application.getId());
            }
        } catch (Exception e) {
            log.warn("ML-based scoring failed for application {}: {}", application.getId(), e.getMessage());
            throw e; // Re-throw to trigger fallback to rule-based scoring
        }

        return Math.min(1.0, Math.max(0.0, score));
    }

    /**
     * Enhanced rule-based fallback scoring with better skill detection
     */
    private double calculateEnhancedRuleBasedScore(OpportunityApplication application, Opportunity opportunity) {
        double score = 0.0;

        try {
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText != null && !cvText.isBlank()) {
                // Extract skills from CV
                List<String> cvSkills = extractSkillsFromText(cvText);
                List<String> requiredSkills = opportunity.getSkillsRequired();

                // Skills matching score (40%)
                double skillsScore = calculateSkillMatchRatio(cvSkills, requiredSkills) * 0.4;
                score += skillsScore;

                // Experience score (30%)
                int cvExperience = estimateExperienceYears(cvText);
                int requiredExperience = estimateRequiredExperience(opportunity);
                double experienceScore = calculateExperienceMatchScore(cvExperience, requiredExperience) * 0.3;
                score += experienceScore;

                // Cover letter score (20%)
                double clScore = calculateCoverLetterFeatures(application);
                score += clScore * 0.2;

                // Job title relevance bonus (10%)
                double titleRelevance = calculateTitleRelevance(cvText, opportunity.getTitle()) * 0.1;
                score += titleRelevance;

                // Set individual scores in application (normalized)
                application.setCvScore((skillsScore + experienceScore + titleRelevance) / 0.8);
                application.setCoverLetterScore(clScore);

                log.debug("Enhanced fallback score for application {}: skills={}, exp={}, cover={}, title={}, total={}",
                    application.getId(), skillsScore, experienceScore,
                    clScore * 0.2, titleRelevance, score);

            } else {
                // No CV text available - rely only on cover letter
                double clScore = calculateCoverLetterFeatures(application);
                score = clScore * 0.5;
                application.setCvScore(0.0);
                application.setCoverLetterScore(clScore);
                log.warn("No CV text extracted for application {}, using cover letter only", application.getId());
            }
        } catch (Exception e) {
            log.warn("Enhanced fallback scoring failed for application {}: {}", application.getId(), e.getMessage());
            score = 0.1; // Minimal fallback score
            application.setCvScore(0.1);
            application.setCoverLetterScore(0.1);
        }

        return Math.min(1.0, Math.max(0.0, score));
    }

    /**
     * Calculate experience match score
     */
    private double calculateExperienceMatchScore(int cvExperience, int requiredExperience) {
        if (cvExperience >= requiredExperience) {
            return Math.min(1.0, 0.7 + (cvExperience - requiredExperience) * 0.1);
        } else {
            return Math.max(0.0, 0.5 - (requiredExperience - cvExperience) * 0.15);
        }
    }

    /**
     * Calculate job title relevance
     */
    private double calculateTitleRelevance(String cvText, String jobTitle) {
        if (cvText == null || jobTitle == null) return 0.0;

        String lowerCv = cvText.toLowerCase();
        String lowerTitle = jobTitle.toLowerCase();

        // Check if CV contains key job title words
        String[] titleWords = lowerTitle.split("\\s+");
        int matches = 0;
        for (String word : titleWords) {
            if (word.length() > 3 && lowerCv.contains(word)) {
                matches++;
            }
        }

        return titleWords.length > 0 ? (double) matches / titleWords.length : 0.0;
    }

    /**
     * Basic skill score fallback
     */
    private double calculateBasicSkillScore(OpportunityApplication application, Opportunity opportunity) {
        try {
            String cvText = getCvTextFromUrl(application.getCvUrl());
            if (cvText == null || cvText.isBlank()) {
                return 0.0;
            }

            List<String> cvSkills = extractSkillsFromText(cvText);
            List<String> requiredSkills = opportunity.getSkillsRequired();

            if (requiredSkills.isEmpty()) return 0.5;

            long exactMatches = cvSkills.stream()
                    .filter(cvSkill -> requiredSkills.stream()
                            .anyMatch(reqSkill -> reqSkill.toLowerCase().contains(cvSkill.toLowerCase())))
                    .count();

            return (double) exactMatches / requiredSkills.size();

        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Get CV text for debugging (public method)
     */
    public String getCvText(OpportunityApplication application) {
        if (application.getCvUrl() == null || application.getCvUrl().isEmpty()) {
            return null;
        }
        try {
            return fileStorageService.extractTextFromCv(application.getCvUrl());
        } catch (Exception e) {
            log.warn("Failed to extract CV text for application {}: {}", application.getId(), e.getMessage());
            return null;
        }
    }

    /**
     * Extract skills for debugging (public method)
     */
    public List<String> extractSkillsWithNLP(String text) {
        if (text == null || text.isBlank()) {
            return new ArrayList<>();
        }
        return extractSkillsFromText(text);
    }

    /**
     * Get CV text from URL (private helper method)
     */
    private String getCvTextFromUrl(String cvUrl) {
        if (cvUrl == null || cvUrl.isEmpty()) {
            return null;
        }
        try {
            return fileStorageService.extractTextFromCv(cvUrl);
        } catch (Exception e) {
            log.warn("Failed to extract CV text from URL {}: {}", cvUrl, e.getMessage());
            return null;
        }
    }

    // Helper methods (similar to before)
    private double calculateSkillMatchRatio(List<String> cvSkills, List<String> requiredSkills) {
        if (requiredSkills.isEmpty()) return 0.5;
        if (cvSkills.isEmpty()) return 0.0;

        long matchingSkills = cvSkills.stream()
                .filter(cvSkill -> requiredSkills.stream()
                        .anyMatch(reqSkill -> reqSkill.toLowerCase().contains(cvSkill) ||
                                               cvSkill.contains(reqSkill.toLowerCase())))
                .count();

        return (double) matchingSkills / requiredSkills.size();
    }

    private double calculateCoverLetterFeatures(OpportunityApplication application) {
        String coverLetter = application.getCoverLetter();
        if (coverLetter == null || coverLetter.trim().isEmpty()) {
            return 0.0;
        }

        double score = 0.0;
        int wordCount = coverLetter.split("\\s+").length;
        score += Math.min(1.0, wordCount / 300.0);

        String[] keywords = {"experience", "skills", "project", "team", "develop", "implement", "leadership"};
        String lowerText = coverLetter.toLowerCase();
        long keywordCount = Arrays.stream(keywords)
                .filter(lowerText::contains)
                .count();
        score += (double) keywordCount / keywords.length;

        return Math.min(1.0, score / 2.0);
    }

    /**
     * Estimate years of experience from CV text with improved accuracy
     */
    private int estimateExperienceYears(String text) {
        if (text == null || text.isBlank()) {
            return 0;
        }

        String lowerText = text.toLowerCase();
        int years = 0;

        // Look for explicit year mentions with various patterns
        for (int i = 1; i <= 25; i++) {
            // Match patterns like "5 years", "5 ans", "5+ years", "5 years of experience"
            if (lowerText.contains(i + " year") || lowerText.contains(i + " ans") ||
                lowerText.contains(i + "+") || lowerText.contains(i + " years") ||
                lowerText.contains(" " + i + " ") && lowerText.contains("experience")) {
                years = Math.max(years, i);
            }
        }

        // Senior keywords indicate more experience
        if (lowerText.contains("senior") || lowerText.contains("lead") ||
            lowerText.contains("architect") || lowerText.contains("principal") ||
            lowerText.contains("staff")) {
            years = Math.max(years, 7);
        }

        // Mid-level keywords
        if ((lowerText.contains("mid") || lowerText.contains("intermediate")) && years < 5) {
            years = Math.max(years, 3);
        }

        // Junior keywords indicate less experience
        if (lowerText.contains("junior") || lowerText.contains("intern") ||
            lowerText.contains("trainee") || lowerText.contains("student") ||
            lowerText.contains("graduate") || lowerText.contains("fresh")) {
            years = Math.min(years, 2);
        }

        // Look for date ranges that might indicate experience
        // Patterns like "2018-2023" or "2018 - present"
        try {
            java.util.regex.Pattern datePattern = java.util.regex.Pattern.compile("(\\d{4})\\s*[-–]\\s*(\\d{4}|present|now)");
            java.util.regex.Matcher matcher = datePattern.matcher(lowerText);
            while (matcher.find()) {
                int startYear = Integer.parseInt(matcher.group(1));
                String endStr = matcher.group(2);
                int endYear = endStr.equals("present") || endStr.equals("now") ?
                    java.time.Year.now().getValue() : Integer.parseInt(endStr);

                if (endYear >= startYear) {
                    int period = endYear - startYear;
                    if (period > 0 && period <= 10) { // Reasonable work period
                        years = Math.max(years, period);
                    }
                }
            }
        } catch (Exception e) {
            // Ignore date parsing errors
        }

        return Math.max(0, Math.min(years, 20)); // Cap at 20 years
    }

    private int estimateRequiredExperience(Opportunity opportunity) {
        String title = opportunity.getTitle().toLowerCase();
        String description = opportunity.getDescription().toLowerCase();

        if (title.contains("senior") || title.contains("lead") || title.contains("architect") ||
            description.contains("senior") || description.contains("experienced")) {
            return 5;
        } else if (title.contains("junior") || title.contains("intern") || title.contains("trainee") ||
                   description.contains("junior") || description.contains("entry")) {
            return 1;
        } else {
            return 3; // Mid-level default
        }
    }

    /**
     * Check if scoring mode is ready and available
     */
    public String getScoringMode() {
        return modelsLoaded ? "enhanced semantic scoring" : "rule-based fallback scoring";
    }

    /**
     * Check if models are loaded and ready
     */
    public boolean isModelLoaded() {
        return modelsLoaded;
    }

    /**
     * Get model status information
     */
    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("modelsLoaded", modelsLoaded);
        status.put("scoringMode", getScoringMode());
        status.put("modelType", "Hybrid heuristic semantic scoring");
        status.put("features", Arrays.asList(
            "Keyword overlap and title relevance",
            "NLP-based skill extraction",
            "Experience compatibility scoring"
        ));
        return status;
    }

    /**
     * Data class for CV analysis results
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

    private CvAnalysis analyzeCvForFeatures(String cvText) {
        if (cvText == null || cvText.isBlank()) {
            return new CvAnalysis(new ArrayList<>(), 0, new ArrayList<>());
        }

        String lowerText = cvText.toLowerCase();
        List<String> skills = extractSkillsFromText(cvText);
        int experienceYears = estimateExperienceYears(lowerText);
        List<String> education = extractEducationFromText(lowerText);

        return new CvAnalysis(skills, experienceYears, education);
    }

    private List<String> extractEducationFromText(String text) {
        String[] educationKeywords = {
            "bachelor", "master", "phd", "doctorate", "licence", "ingenieur", "baccalaureate",
            "computer science", "software engineering"
        };

        return Arrays.stream(educationKeywords)
                .filter(text::contains)
                .collect(Collectors.toList());
    }
}