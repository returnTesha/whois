package handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/returnTesha/whois/internal/domain"
	"github.com/returnTesha/whois/internal/provider"
)

type DrawingHandler struct {
	SpringProvder provider.Provider
}

func (h *DrawingHandler) AnalyzeQuestionMark(c *fiber.Ctx) error {
	var req domain.DrawingRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	result, err := h.SpringProvder.Excute(c.Context(), req)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(result)
}
