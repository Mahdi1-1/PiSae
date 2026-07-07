# Machine Learning Candidate Recommendation System

## Overview

The candidate recommendation system now uses **pre-trained Hugging Face models** for intelligent candidate ranking and scoring. Instead of training custom models, we leverage state-of-the-art NLP models for semantic understanding and advanced text analysis.

## Architecture

### Components

1. **CandidateMLService**: Core ML service using Hugging Face models
2. **RecommendationService**: Updated to use ML-powered scoring
3. **MarketplaceController**: ML status endpoint

### Pre-trained Models Used

- **Sentence Transformers (all-MiniLM-L6-v2)**: For semantic similarity between job descriptions and CVs
- **Advanced NLP**: For intelligent skill extraction and text analysis

## How It Works

### Semantic Similarity Matching

1. **Job-CV Matching**: Uses sentence embeddings to understand semantic meaning
2. **Context-Aware Analysis**: Goes beyond keyword matching to understand context
3. **Multi-Chunk Processing**: Analyzes CV in meaningful chunks for better accuracy

### Advanced Skill Extraction

1. **NLP-Based Skills**: Uses linguistic patterns and context
2. **Skill Groups**: Recognizes related technologies (e.g., "Java ecosystem")
3. **Semantic Skill Matching**: Matches skills even with different terminology

### Scoring Algorithm

```
Final Score = (Semantic Similarity × 0.5) + (Skill Match × 0.3) + (Experience × 0.2)
```

## API Endpoints

### ML Model Management

- `GET /api/community/marketplace/ml/status` - Get ML model status and capabilities

### Enhanced Recommendations

- `GET /api/community/marketplace/{opportunityId}/recommendations` - Get AI-powered candidate rankings

## Benefits

- **State-of-the-Art Accuracy**: Uses latest NLP research from Hugging Face
- **No Training Required**: Ready to use immediately with pre-trained models
- **Semantic Understanding**: Understands meaning, not just keywords
- **Advanced Text Analysis**: Better skill and experience extraction
- **Scalable**: Handles complex language patterns automatically

## Dependencies

- **Deep Java Library (DJL) 0.28.0**: Java ML framework for Hugging Face integration
- **PyTorch Engine**: For running transformer models
- **Hugging Face Tokenizers**: For text preprocessing

## Model Details

### Sentence Transformers (all-MiniLM-L6-v2)
- **Purpose**: Semantic text similarity
- **Dimensions**: 384
- **Performance**: Fast inference, high accuracy
- **Use Case**: Job-CV matching, skill similarity

### Features Extracted
- Semantic similarity scores between job requirements and CV content
- Advanced skill detection with context awareness
- Experience level compatibility
- Cover letter quality analysis

## Advantages Over Custom Training

- **Immediate Results**: No waiting for training data
- **Research-Backed**: Uses models trained on massive datasets
- **Continuous Updates**: Can easily upgrade to newer model versions
- **Generalization**: Works well across different domains and languages
- **Reliability**: Proven performance on various NLP tasks

## Future Enhancements

- **Domain-Specific Models**: Fine-tune on recruitment data
- **Multi-Language Support**: Support for different languages
- **Additional Models**: NER for entity extraction, classification for roles
- **Ensemble Methods**: Combine multiple model predictions