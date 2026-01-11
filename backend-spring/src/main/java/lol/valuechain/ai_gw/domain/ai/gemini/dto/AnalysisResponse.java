package lol.valuechain.ai_gw.domain.ai.gemini.dto;

public record AnalysisResponse(int similarity, String feedback, String feedback_ko) {}
