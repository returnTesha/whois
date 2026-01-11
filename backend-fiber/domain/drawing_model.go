package domain

// 사용자가 보낸 이미지 데이터 (Base64 등)
type DrawingRequest struct {
	ImageData string `json:"image_data"` // 캔버스에서 넘어온 이미지 데이터
}

// Spring AI로부터 받은 분석 결과
type AnalysisResult struct {
	Similarity float64 `json:"similarity"`
	Feedback   string  `json:"feedback"`
	FeedbackKo string  `json:"feedback_ko"`
}
