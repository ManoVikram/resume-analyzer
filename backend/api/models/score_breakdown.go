package models

type ScoreBreakdown struct {
	ImpactMetrics    int32 `json:"impact_metrics"`
	JDAlignment      int32 `json:"jd_alignment"`
	OwnershipSignals int32 `json:"ownership_signals"`
	RemoteReadiness  int32 `json:"remote_readiness"`
}
