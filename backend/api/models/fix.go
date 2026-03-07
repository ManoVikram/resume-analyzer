package models

type Fix struct {
	Problem      string `json:"problem"`
	WhyItMatters string `json:"why_it_matters"`
	Improvement  string `json:"improvement"`
}
