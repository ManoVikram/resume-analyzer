import logging
from io import BytesIO

import anthropic
import docx  # python-docx
import fitz  # PyMuPDF
import grpc
from pydantic import BaseModel, Field

from proto import resume_analyzer_pb2, resume_analyzer_pb2_grpc

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OverallScore(BaseModel):
    score: int = Field(description="Overall score between 0 and 100", ge=0, le=100)
    interpretation: str = Field(description="One of: 'Strong shortlist potential', 'Competitive but risky', 'Likely rejected', 'Major alignment gaps'")


class ScoreBreakdown(BaseModel):
    impact_metrics: int = Field(description="Score for impact metrics, between 0 and 100", ge=0, le=100)
    jd_alignment: int = Field(description="Score for job description alignment, between 0 and 100", ge=0, le=100)
    ownership_signals: int = Field(description="Score for ownership signals, between 0 and 100", ge=0, le=100)
    remote_readiness: int = Field(description="Score for remote readiness, between 0 and 100", ge=0, le=100)


class Fix(BaseModel):
    problem: str = Field(description="Specific problem identified in the resume")
    why_it_matters: str = Field(description="Explanation of why the problem is significant")
    improvement: str = Field(description="Suggested improvement for the problem")


class ResumeAnalysis(BaseModel):
    overall: OverallScore = Field(description="Overall score and interpretation")
    breakdown: ScoreBreakdown = Field(description="Detailed breakdown of scores across different dimensions")
    recruiter_risks: list[str] = Field(description="4 to 6 short bullets highlighting red flags a recruiter would spot in 7 seconds", min_length=4, max_length=6)
    strengths: list[str] = Field(description="3 to 5 short bullets highlighting the strengths of the resume", min_length=3, max_length=5)
    top_fixes: list[Fix] = Field(description="Top 5 ranked fixes, most impactful first", min_length=1, max_length=5)


class ResumeAnalyzerServicer(resume_analyzer_pb2_grpc.ResumeAnalyzerServicer):
    """
    This class implements the gRPC service defined in the proto file.
    It will handle the incoming requests and return the appropriate responses.
    """
    def __init__(self):
        self.client = anthropic.Anthropic()
        logging.info("ResumeAnalyzerServicer initialized")

    def _extract_text(self, file_bytes: bytes, filename: str) -> str:
        """
        Extract text from the uploaded file.
        """
        filename_lower = filename.lower()

        if filename_lower.endswith(".pdf"):
            return self._extract_from_pdf(file_bytes)
        elif filename_lower.endswith(".docx"):
            return self._extract_from_docx(file_bytes)
        elif filename_lower.endswith(".doc"):
            raise ValueError("Unsupported file format: .doc is not supported. Please convert it to .docx or .pdf")
        else:
            raise ValueError(f"Unsupported file format: {filename}. Only .pdf and .docx are supported.")
    
    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        return "\n".join(str(page.get_text("text")) for page in doc)

    def _extract_from_docx(self, file_bytes: bytes) -> str:
        doc = docx.Document(docx=BytesIO(file_bytes))
        return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    
    def _build_prompt(self, resume_text: str, jd_text: str):
        return f"""Analyze this developer resume against the job description below.
                The candidate has 0-2 years of experience and is targeting US remote startup roles.

                Respond ONLY with a JSON object matching this EXACT schema.

                Return ONLY raw JSON.
                Do NOT wrap the JSON in markdown.
                Do NOT include ```json or ``` anywhere.
                Do NOT include explanations.
                The response must start with '{' and end with '}'.

                Respond ONLY with a JSON object matching this EXACT schema:
                {{
                "overall": {{
                    "score": <int 0-100>,
                    "interpretation": <"Strong shortlist potential" | "Competitive but risky" | "Likely rejected" | "Major alignment gaps">
                }},
                "breakdown": {{
                    "impact_metrics": <int 0-100, weight 30%>,
                    "jd_alignment": <int 0-100, weight 30%>,
                    "ownership_signals": <int 0-100, weight 20%>,
                    "remote_readiness": <int 0-100, weight 20%>
                }},
                "recruiter_risks": [<4-6 short bullet strings highlighting red flags>],
                "strengths": [<3-5 short bullet strings highlighting what is working>],
                "top_fixes": [
                    {{
                    "problem": <specific problem string>,
                    "why_it_matters": <why this matters for US remote roles>,
                    "improvement": <concrete improved bullet or action>
                    }}
                ]
                }}

                Scoring bands:
                - 80+   → Strong shortlist potential
                - 65-79 → Competitive but risky
                - 50-64 → Likely rejected
                - <50   → Major alignment gaps

                The overall score must be the weighted average:
                (impact_metrics * 0.30) + (jd_alignment * 0.30) + (ownership_signals * 0.20) + (remote_readiness * 0.20)

                ---
                RESUME:
                {resume_text}

                ---
                JOB DESCRIPTION:
                {jd_text}"""

    def _analyze(self, resume_text: str, jd_text: str) -> ResumeAnalysis:
        """
        Analyze the extracted text using Claude and return the analysis results.
        """
        prompt = self._build_prompt(resume_text=resume_text, jd_text=jd_text)

        response = self.client.messages.parse(
            model="claude-haiku-4-5",
            max_tokens=2048,
            temperature=0.2,
            system=(
                "You are an expert technical recruiter and resume coach specializing in evaluating "
                "developer resumes (0-2 years experience) for US remote startup roles.\n\n"
                "You must respond ONLY with a valid JSON object. NO PREAMBLE, NO EXPLANATION, NO MARKDOWN. "
                "Just raw JSON that matches the exact schema provided."
            ),
            messages=[
                {"role": "user", "content": prompt}
            ],
            output_format=ResumeAnalysis
        )

        if response.parsed_output is None:
            raise ValueError(f"Failed to parse Claude response to ResumeAnalysis model.")

        return response.parsed_output

    def AnalyzeResume(self, request, context):
        """
        """
        try:
            # Step 1 - Extract text from the uploaded file
            resume_text = self._extract_text(
                file_bytes=request.file_bytes,
                filename=request.filename
            )

            # Step 2 - Run analysis with Claude
            resume_analysis = self._analyze(resume_text=resume_text, jd_text=request.jd_text)

            # Step 3 - Map Pydantic model to proto response and return it
            resume_analysis_grpc_response = resume_analyzer_pb2.AnalyzeResumeResponse(
                success=True,
                overall_score=resume_analyzer_pb2.OverallScore(
                    score=resume_analysis.overall.score,
                    interpretation=resume_analysis.overall.interpretation
                ),
                score_breakdown=resume_analyzer_pb2.ScoreBreakdown(
                    impact_metrics=resume_analysis.breakdown.impact_metrics,
                    jd_alignment=resume_analysis.breakdown.jd_alignment,
                    ownership_signals=resume_analysis.breakdown.ownership_signals,
                    remote_readiness=resume_analysis.breakdown.remote_readiness
                ),
                recruiter_risks=resume_analysis.recruiter_risks,
                strengths=resume_analysis.strengths,
                top_fixes=[
                    resume_analyzer_pb2.Fix(
                        problem=fix.problem,
                        why_it_matters=fix.why_it_matters,
                        improvement=fix.improvement
                    )
                    for fix in resume_analysis.top_fixes
                ]
            )

            return resume_analysis_grpc_response
        except Exception as error:
            logging.error(f"Error analyzing resume: {error}")

            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(f"Error analyzing resume: {error}")

            return resume_analyzer_pb2.AnalyzeResumeResponse(
                success=False,
                error=str(error)
            )