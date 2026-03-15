package routes

import (
	"net/http"

	"github.com/ManoVikram/resume-analyzer/backend/api/handlers"
	"github.com/ManoVikram/resume-analyzer/backend/api/middleware"
	pb "github.com/ManoVikram/resume-analyzer/backend/api/proto"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(server *gin.Engine, grpcClient pb.ResumeAnalyzerClient) {
	// GET request for API health check
	server.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "resume-analyzer-api",
			"message": "Resume Analyzer API is healthy and running",
		})
	})

	// API v1 routes
	v1 := server.Group("/api/v1")

	// Protected routes (requires authentication)
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// POST request to analyze the resume and job description
		v1.POST("/analyze", handlers.NewResumeAnalysisHandler(grpcClient).Analyze)
	}
}
