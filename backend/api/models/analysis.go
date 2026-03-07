package models

type Analysis struct {
	Success        bool            `json:"success"`
	Error          string          `json:"error,omitempty"`
	OverallScore   *OverallScore   `json:"overall_score,omitempty"`
	ScoreBreakdown *ScoreBreakdown `json:"score_breakdown,omitempty"`
	RecruiterRisks []string        `json:"recruiter_risks,omitempty"`
	Strengths      []string        `json:"strengths,omitempty"`
	TopFixes       []*Fix          `json:"top_fixes,omitempty"`
}
