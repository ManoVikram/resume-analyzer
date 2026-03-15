"use server"

import { createClient } from "../supabase/server"

const API_BASE_URL = `${process.env.HTTP_HOST}:${process.env.HTTP_PORT}`

export async function analyzeResume(file, jobDescription) {
    // Step 1 - Create supabase server client
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Step 1 - Create FormData and append file and job description
    const formData = new FormData()
    formData.append("resume_file", file)
    formData.append("jd_text", jobDescription)

    // Step 2 - Send POST request to backend API
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${session.access_token}`
        },
        body: formData
    })

    // Step 3 - Handle response
    if (!response.ok) {
        throw new Error("Failed to analyze resume")
    }

    return response.json()
}