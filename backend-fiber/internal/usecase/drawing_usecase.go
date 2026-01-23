package usecase

import "context"

type DrawingUsecase interface {
	ProcessAndAnalyze(ctx context.Context)
}
