package routes

import (
	"net/http"

	pb "github.com/ManoVikram/resume-analyzer/backend/api/proto"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(server *gin.Engine, grpcClinet pb.ResumeAnalyzerClient) {
	// GET request for API health check
	server.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "resume-analyzer-api",
			"message": "Resume Analyzer API is healthy and running",
		})
	})
}
