"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { HugeiconsIcon } from "@hugeicons/react";
import { Login01FreeIcons } from "@hugeicons/core-free-icons";

import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message || "An error occurred");
        setIsLoading(false);
      } else {
        toast.success("Login Successfully");
        // Use router.push instead of window.location.replace to allow auth state to settle
        // Add a small delay to ensure the session is properly established
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 100);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="flex bg-[url('/login-background.webp')] min-h-screen items-center justify-center bg-cover bg-no-repeat">
      <Card className="w-full max-w-sm bg-background/10 backdrop-blur-sm border-none">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/30"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/30"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
              />
            </div>

            <Button
              onClick={handleLogin}
              className="w-full mt-2"
              disabled={isLoading}
            >
              <HugeiconsIcon icon={Login01FreeIcons} className="" />
              <span>{isLoading ? "Logging in..." : "Login"}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
