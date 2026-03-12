const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function analyzeResume(file, jdText) {
  const form = new FormData();
  form.append("resume_file", file);
  form.append("jd_text", jdText);

  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Analysis failed. Please try again.");
  }

  return data;
}