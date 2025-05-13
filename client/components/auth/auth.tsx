"use client";

import { useState } from "react";

type AuthProps = {
    baseUrl: string;
  };
  
export default function Auth({ baseUrl }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState<"error" | "success">("success"); 

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const formatErrorMessage = (msg: string) => {
    switch (msg) {
      case "Username length must be between 3 and 10 characters":
        return "Username must be between 3 and 10 characters long.";
      case "Invalid email":
        return "Please enter a valid email address.";
      case "Password must be between 5 and 20 characters long":
        return "Password must be between 5 and 20 characters long.";
      case "Username has already been taken":
        return "This username is already in use.";
      case "Email has already been taken":
        return "This email address is already in use.";
      case "Invalid user/password combination":
        return "The username and password do not match.";
      default:
        return msg;
    }
  };

  const showMessage = (
    msg: string,
    type: "error" | "success",
    redirect = false
  ) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      if (redirect && type === "success") {
        window.location.href = "/";
      }
    }, 1000);
  };

  async function doLogin(username: string, password: string) {
    try {
      const res = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      showMessage("Login successful!", "success", true);
    } catch (err: any) {
      showMessage(formatErrorMessage(err.message), "error");
    }
  }

  const handleGuestLogin = async () => {
    await doLogin("guest", "guest");
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string).toLowerCase();
    const password = formData.get("password") as string;

    try {
      const res = await fetch(`${baseUrl}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      let data;
      try {
        data = await res.json();
      } catch (error:any) {
        showMessage("Unexpected response from server.", "error");
        return;
      }

      if (!res.ok) {
        showMessage(formatErrorMessage(data || "Login failed"), "error");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username",data.username);
        showMessage("Login successful!", "success", true);
      }
    } catch (error:any) {
      showMessage(error.message, "error");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = (formData.get("username") as string).toLowerCase();
    const email = (formData.get("email") as string).toLowerCase();
    const password = formData.get("password") as string;

    try {
      const res = await fetch(`${baseUrl}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if(!res.ok){
        const text = await res.text();
        throw new Error(text);
      }
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        showMessage("Unexpected response from server.", "error");
        return;
      }

      if (!res.ok) {
        showMessage(formatErrorMessage(data || "Registration failed"), "error");
      } else {
        showMessage("Registration successful!", "success", true);
      }
    } catch (error:any) {
      showMessage(error.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 relative">
      {message && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-white rounded shadow-lg z-50 ${
            messageType === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {message}
        </div>
      )}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-extrabold text-primary dark:text-white">
          Fakeverse
        </h1>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded shadow-md">
        {isLogin ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <form key="login" onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-3 py-2 rounded"
              >
                Login
              </button>
            </form>
            <button
              onClick={handleGuestLogin}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded"
            >
              Continue as Guest
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form key="register" onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white px-3 py-2 rounded"
              >
                Register
              </button>
            </form>
          </>
        )}
        <div className="mt-4 text-center">
          <button onClick={toggleForm} className="text-blue-500 hover:underline">
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
