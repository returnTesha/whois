package lol.valuechain.ai_gw.domain.ai.gemini.service;

import lol.valuechain.ai_gw.domain.ai.gemini.dto.AnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAnalysisService {
    private final ChatClient chatClient;
    private static final String DEBUG_DIR = "/mnt/debug_images";
    public AnalysisResponse analyzeQuestionMark(String base64Image, String traceID) {
        try {
            byte[] imageBytes = decodeBase64(base64Image);

            if (traceID == null || traceID.isEmpty()) {
                traceID = "define_"+UUID.randomUUID().toString();
            }

            Path directory = Paths.get(DEBUG_DIR);

            // 폴더가 없으면 생성
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }

            // 파일명 생성 (중복 방지를 위해 UUID 사용)
            String fileName = traceID + ".png";
            Path filePath = directory.resolve(fileName);

            Files.write(filePath, imageBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            log.info("Debug image saved - traceID: {}, path: {}", traceID, filePath.toAbsolutePath());

            return chatClient.prompt()
                    .user(u -> u
                            .text("Analyze the similarity of the handwritten drawing in the image to a question mark symbol '?'. " +
                                    "You must respond in JSON format with the following keys: " +
                                    "'similarity' (a number between 0 and 100), " +
                                    "'feedback' (helpful feedback in English), " +
                                    "'feedback_ko' (the same feedback translated into natural Korean). " +
                                    "Ensure the Korean translation sounds friendly and encouraging.")
                            .media(MimeTypeUtils.IMAGE_PNG, new ByteArrayResource(imageBytes))
                    )
                    // .entity()를 쓰면 자동으로 JSON 파싱을 시도합니다.
                    .call()
                    .entity(AnalysisResponse.class);

        } catch (Exception e) {
            e.printStackTrace();
            // 에러 발생 시 규격에 맞는 기본 객체 반환
            return new AnalysisResponse(0, "Error: " + e.getMessage(), "오류: " + e.getMessage());
        }
    }

    private byte[] decodeBase64(String base64Image) {
        if (base64Image.contains(",")) {
            base64Image = base64Image.split(",")[1];
        }
        base64Image = base64Image.replaceAll("\\s", "");
        return Base64.getDecoder().decode(base64Image);
    }

}
