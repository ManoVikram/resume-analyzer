import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do not add any logic between createServerClient and getUser
    // A seemingly innocent change could cause hard to debug session issues
    const { data: { user } } = await supabase.auth.getUser()

    // Protect /analyze — redirect to /login if not authenticated
    if (!user && request.nextUrl.pathname.startsWith("/analyze")) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = "/login"
        return NextResponse.redirect(loginUrl)
    }

    // Redirect logged in users away from /login
    if (user && request.nextUrl.pathname.startsWith("/login")) {
        const analyzeUrl = request.nextUrl.clone()
        analyzeUrl.pathname = "/analyze"
        return NextResponse.redirect(analyzeUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}