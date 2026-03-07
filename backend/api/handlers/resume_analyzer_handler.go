package handlers

import (
	pb "github.com/ManoVikram/resume-analyzer/backend/api/proto"
	"github.com/gin-gonic/gin"
)

func ResumeAnalyzerHandler(grpcClient pb.ResumeAnalyzerClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		
	}
}