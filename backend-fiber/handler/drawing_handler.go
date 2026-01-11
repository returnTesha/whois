package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/returnTesha/whois/domain"
)

type DrawingHandler struct {
	Service domain.DrawingService
}

func (h *DrawingHandler) AnalyzeQuestionMark(c *fiber.Ctx) error {

	traceID, ok := c.Locals("traceID").(string)
	if !ok || traceID == "" {
		// fallback (middleware를 거치지 않은 경우)
		traceID = "unknown"
	}

	var req domain.DrawingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// 서비스 내부에서 고루틴으로 동작하므로, 여러 요청이 와도 각기 독립적으로 대기함
	result, err := h.Service.ProcessAndAnalyze(req.ImageData, traceID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(result)
}
