"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { Feed } from "@/components/feed";
import Auth from "@/components/auth/auth"; 


export default function HomePage() {
  const [token, setToken] = useState<string | null>(null);
  /*const baseUrl = "http://localhost:5000"*/
  const baseUrl = "https://fakeverse-2.onrender.com"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      } else {
        console.warn("No token found in localStorage. The user might need to log in.");
      }
    }
  }, []);


  if (!token) {
    return <Auth baseUrl={baseUrl}/>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar baseUrl={baseUrl}/>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="hidden md:block">
          <Sidebar baseUrl={baseUrl}/>
        </div>
        <div className="md:col-span-2">
          <Feed baseUrl={baseUrl} />
        </div>
      </div>
    </div>
  );
}
