"use client"

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import React, { useState } from 'react'
import { toast } from 'sonner'

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignUp, setIsSignUp] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const supabase = createClient()

    const handleGoogleAuth = async () => {
        setIsLoading(true)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            toast.error(error.message)
        }

        setIsLoading(false)
    }

    const handleEmailAuth = async (event) => {
        event.preventDefault()

        if (!email || !password) return

        setIsLoading(true)

        const { error } = isSignUp ? await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        }) : await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            toast.error(error.message)
        } else if (isSignUp) {
            toast.success("Check your email to confirm your account.")
        }

        setIsLoading(false)
    }

    return (
        <section className="min-h-dvh w-full flex justify-center items-center px-6">
            <div className="w-full max-w-sm flex flex-col justify-start items-start gap-8">
                {/* Logo */}
                <div className="w-full flex flex-col justify-start items-start gap-3">
                    <h2 className="text-4xl font-dm-serif-display tracking-tighter text-primary">switch<span className="italic text-secondary">worthy</span></h2>

                    <p className="text-sm text-secondary font-light">
                        {isSignUp ? "Create an account to get started." : "Welcome back. Sign in to continue."}
                    </p>
                </div>

                {/* Google OAuth */}
                <button className="w-full flex justify-center items-center gap-4 bg-white border border-secondary/20 hover:border-primary transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl px-6 py-3 cursor-pointer" onClick={handleGoogleAuth}>
                    <Image src="/google-logo.svg" alt='google-log' width={20} height={20} />

                    <p className="text-sm">Continue with Google</p>
                </button>

                {/* Divider */}
                <div className="w-full flex items-center gap-3">
                    <span className="flex-1 h-px bg-secondary" />
                    <span className="text-xs text-secondary font-light">or</span>
                    <span className="flex-1 h-px bg-secondary" />
                </div>

                {/* Email + Password */}
                <form className='w-full flex flex-col gap-6' onSubmit={handleEmailAuth}>
                    <div className="flex flex-col justify-start items-start gap-3">
                        <input type="email" placeholder="Email" value={email} className="w-full bg-white border border-secondary/20 rounded-2xl px-6 py-3 text-sm font-light text-primary outline-none focus:border-primary transition-colors duration-200 placeholder:text-secondary" onChange={(event) => setEmail(event.target.value)} />

                        <input type="password" placeholder="Password" value={password} className="w-full bg-white border border-secondary/20 rounded-2xl px-6 py-3 text-sm font-light text-primary outline-none focus:border-primary transition-colors duration-200 placeholder:text-secondary" onChange={(event) => setPassword(event.target.value)} />
                    </div>

                    <button type="submit" disabled={isLoading || !email || !password} className='w-full flex justify-center items-center bg-primary text-white rounded-2xl px-6 py-3 text-sm font-medium hover:scale-105 transition-transform duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer'>
                        {isLoading ? "Please wait..." : (isSignUp ? "Sign up" : "Sign in")}
                    </button>
                </form>

                {/* Toggle sign in / sign up */}
                <p className="w-full text-xs text-secondary text-center font-light">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}

                    <button className="text-primary font-medium underline bg-transparent border-none cursor-pointer" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Sign in" : "Sign up"}
                    </button>
                </p>
            </div>
        </section>
    )
}

export default Login