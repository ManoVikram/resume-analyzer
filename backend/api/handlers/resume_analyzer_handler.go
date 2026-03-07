package handlers

import (
	"context"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/ManoVikram/resume-analyzer/backend/api/models"
	pb "github.com/ManoVikram/resume-analyzer/backend/api/proto"
	"github.com/gin-gonic/gin"
)

type ResumeAnalysisHandler struct {
	grpcClient pb.ResumeAnalyzerClient
}

func NewResumeAnalysisHandler(grpcClient pb.ResumeAnalyzerClient) *ResumeAnalysisHandler {
	return &ResumeAnalysisHandler{
		grpcClient: grpcClient,
	}
}

func (handler *ResumeAnalysisHandler) Analyze(c *gin.Context) {
	// Step 1 - Parse the multipart form (max 10MB)
	if err := c.Request.ParseMultipartForm(10 << 20); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form. Ensure the file is not too large (max 10MB). Error: " + err.Error()})
		return
	}

	// Step 2 - Validate and read the JD text
	jdText := c.PostForm("jd_text")
	if jdText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job Description (jd_text) is required"})
		return
	}

	// Step 3 - Validate and read the resume file
	file, fileHeader, err := c.Request.FormFile("resume_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read resume file. Ensure a file is uploaded. Error: " + err.Error()})
		return
	}
	defer file.Close()

	filename := fileHeader.Filename
	if !isSupportedFormat(filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported file format. Only PDF and DOCX are allowed."})
		return
	}

	// Step 4 - Read file bytes
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read resume file. Error: " + err.Error()})
		return
	}

	// Step 5 - Call the gRPC service to analyze the resume (30s timeout)
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	grpcResponse, err := handler.grpcClient.AnalyzeResume(ctx, &pb.AnalyzeResumeRequest{
		FileBytes: fileBytes,
		Filename:  filename,
		JdText:    jdText,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze resume. Error: " + err.Error()})
		return
	}

	// Step 6 - Handle error from the Python service
	if !grpcResponse.Success {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "Resume analysis failed. Error: " + grpcResponse.Error})
		return
	}

	// Step 7 - Return the analysis result
	overallScore := &models.OverallScore{
		Score:          grpcResponse.OverallScore.Score,
		Interpretation: grpcResponse.OverallScore.Interpretation,
	}
	scoreBreakdown := &models.ScoreBreakdown{
		ImpactMetrics:    grpcResponse.ScoreBreakdown.ImpactMetrics,
		JDAlignment:      grpcResponse.ScoreBreakdown.JdAlignment,
		OwnershipSignals: grpcResponse.ScoreBreakdown.OwnershipSignals,
		RemoteReadiness:  grpcResponse.ScoreBreakdown.RemoteReadiness,
	}
	topFixes := make([]*models.Fix, 0, len(grpcResponse.TopFixes))
	for _, fix := range grpcResponse.TopFixes {
		topFixes = append(topFixes, &models.Fix{
			Problem:      fix.Problem,
			WhyItMatters: fix.WhyItMatters,
			Improvement:  fix.Improvement,
		})
	}
	response := models.Analysis{
		Success:        grpcResponse.Success,
		OverallScore:   overallScore,
		ScoreBreakdown: scoreBreakdown,
		RecruiterRisks: grpcResponse.RecruiterRisks,
		Strengths:      grpcResponse.Strengths,
		TopFixes:       topFixes,
	}

	c.JSON(http.StatusOK, response)
}

func isSupportedFormat(filename string) bool {
	filenameLower := strings.ToLower(filename)
	return strings.HasSuffix(filenameLower, ".pdf") || strings.HasSuffix(filenameLower, ".docx")
}
