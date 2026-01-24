package domain

type DrawingRequest struct {
	ImageData string `json:"image"`
}
type AnalysisResult struct {
	Similarity float64 `json:"similarity"`
	Feedback   string  `json:"feedback"`
	FeedbackKo string  `json:"feedback_ko"`
	TxId       string  `json:"tx_id"`
}

type SpringAIResponse struct {
	Status string         `json:"status"`
	Data   AnalysisResult `json:"data"`
}

type AnalysisHistory struct {
	// 1. 기본 접속 정보
	Timestamp string `json:"timestamp"`
	TraceID   string `json:"traceID"`
	IP        string `json:"ip"`
	UserAgent string `json:"userAgent"`
	Referer   string `json:"referer"`
	Path      string `json:"path"`

	// 2. 환경 분석 정보 (OS, 브라우저 등)
	Device  string `json:"device"`
	Browser string `json:"browser"`
	OS      string `json:"os"`

	// 3. AI 분석 결과
	Similarity float64 `json:"similarity"`
	Feedback   string  `json:"feedback"`
	FeedbackKo string  `json:"feedback_ko"`
	TxId       string  `json:"txId"`
	Status     int     `json:"status"`
	Error      string  `json:"error,omitempty"`
}
