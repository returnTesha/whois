package domain

type DrawingRequest struct {
	ImageData string `json:"image_data"`
}
type AnalysisResult struct {
	Similarity float64 `json:"similarity"`
	Feedback   string  `json:"feedback"`
	FeedbackKo string  `json:"feedback_ko"`
}

type SpringAIResponse struct {
	Status string         `json:"status"`
	Data   AnalysisResult `json:"data"`
}
