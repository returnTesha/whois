package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/returnTesha/whois/internal/domain"
	"github.com/returnTesha/whois/internal/usecase"
)

type DrawingHandler struct {
	Usecase usecase.DrawingUsecase
}

func (h *DrawingHandler) AnalyzeQuestionMark(c *fiber.Ctx) error {
	traceID, _ := c.Locals("traceID").(string)
	ip := c.Get("X-Forwarded-For", c.IP())
	ua := c.Get("User-Agent")
	path := c.Path()

	var req domain.DrawingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	result, err := h.Usecase.ProcessAndAnalyze(c, req, traceID, ip, ua, path)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(result)
}
