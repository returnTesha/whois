package lol.valuechain.ai_gw.domain.ai.gemini.web;

import lol.valuechain.ai_gw.domain.ai.gemini.dto.AnalysisResponse;
import lol.valuechain.ai_gw.domain.ai.gemini.service.GeminiAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/analyze")
@RequiredArgsConstructor
@Slf4j
public class GeminiAnalysisController {
    private final GeminiAnalysisService geminiAnalysisService;

    @PostMapping
    public ResponseEntity<AnalysisResponse> analyze(@RequestBody Map<String, String> payload,
                                                    @RequestHeader(value = "X-Trace-ID", required = false) String traceID) {
        AnalysisResponse analysisResponse = geminiAnalysisService.analyzeQuestionMark(payload.get("image"), traceID);
        log.info("result : {}" , analysisResponse.toString());
        return ResponseEntity.status(HttpStatus.OK).body(analysisResponse);
    }
}
