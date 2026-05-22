import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const API = "http://localhost:3000/login";

    const loginPost = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(API, {
                email: login,
                password: password,
            });

            localStorage.setItem("token", res.data.token);

            navigate("/dashboard");

        } catch (error) {
            console.log(error);
        }
    };


    return (
        <div className="flex min-h-screen w-full">
            {/* ───────────── LEFT PANEL ───────────── */}
            <div
                className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: "#1a2e6e" }}
            >
                {/* subtle top-left decorative rectangle */}
                <div
                    className="absolute top-8 left-8 w-32 h-40 rounded-md opacity-20 border-2 border-white"
                />
                {/* study illustration */}
                <img
                    src="/study.svg"
                    alt="Student studying"
                    className="w-[85%] max-w-lg object-contain drop-shadow-2xl"
                />
            </div>

            {/* ───────────── RIGHT PANEL ───────────── */}
            <div className="flex flex-col w-full md:w-1/2 bg-white">
                {/* Center content vertically */}
                <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 gap-[20px]">

                    <p className="text-center text-[10px] font-semibold tracking-widest text-gray-600 uppercase mb-3 leading-4">
                        Najot ta'lim
                    </p>

                    <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-5 overflow-hidden shadow-sm">
                        <img
                            src="/Najot_ta'lim_Logo.jpg"
                            alt="Najot ta'lim Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h1 className="text-base font-bold tracking-widest text-gray-800 uppercase mb-[20px] text-center pb-[20px]">
                        Learning Management System
                    </h1>

                    {/* Form */}
                    <form onSubmit={loginPost} className="flex flex-col w-full max-w-xs space-y-5 gap-5">

                        <div className="flex flex-col gap-[10px]">
                            <label
                                htmlFor="email-input"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email-input"
                                type="text"
                                placeholder="Emailni kiriting"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full h-10 px-4 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-[10px]">
                            <label
                                htmlFor="password-input"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Parol
                            </label>
                            <div className="relative">
                                <input
                                    id="password-input"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Parolni kiriting"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-[40px] px-4 pr-10 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 transition"
                                    aria-label={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.34-4.34M6.1 6.1A9.77 9.77 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-2.34 4.34M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-[40px] cursor-pointer py-2 text-sm font-semibold text-white rounded transition-all duration-200 hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "#1a56db" }}
                        >
                            Kirish
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <footer className="text-center text-[10px] text-gray-400 py-4 border-t border-gray-100">
                    Copyright © 2026 of Najot ta'lim
                </footer>
            </div>
        </div>
    );
}