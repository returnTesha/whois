package domain

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type DrawingService interface {
	ProcessAndAnalyze(imageData string, traceID string) (*AnalysisResult, error)
}

type drawingService struct {
	SpringAIEndpoint string
	HttpClient       *http.Client
}

// ⭐ endpoint만 받음 (traceID 제거)
func NewDrawingService(endpoint string) DrawingService {
	return &drawingService{
		SpringAIEndpoint: endpoint,
		HttpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *drawingService) ProcessAndAnalyze(imageData string, traceID string) (*AnalysisResult, error) {
	resultChan := make(chan *AnalysisResult)
	errChan := make(chan error)

	go func() {
		requestBody, err := json.Marshal(map[string]string{
			"image": imageData,
		})
		if err != nil {
			errChan <- fmt.Errorf("marshal error: %v", err)
			return
		}

		req, err := http.NewRequest("POST", s.SpringAIEndpoint+"/analyze", bytes.NewBuffer(requestBody))
		if err != nil {
			errChan <- fmt.Errorf("request creation error: %v", err)
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("X-Trace-ID", traceID) // ⭐ 파라미터로 받은 traceID 사용

		resp, err := s.HttpClient.Do(req)
		if err != nil {
			errChan <- fmt.Errorf("Spring AI connection error: %v", err)
			return
		}
		defer resp.Body.Close()

		var res AnalysisResult
		if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
			errChan <- fmt.Errorf("decode error: %v", err)
			return
		}

		resultChan <- &res
	}()

	select {
	case result := <-resultChan:
		return result, nil
	case err := <-errChan:
		return nil, err
	case <-time.After(35 * time.Second):
		return nil, fmt.Errorf("AI analysis timed out")
	}
}
