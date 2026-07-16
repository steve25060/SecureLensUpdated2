"use client";

import { GitBranch, Globe2 } from "lucide-react";
import { useState } from "react";

type Props = {
  onGitHub?: () => void;
  onGoogle?: () => void;
};

function SocialButton({
  icon: Icon,
  label,
  onClick,
  loading,
}: {
  icon: typeof GitBranch;
  label: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.06] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="h-4 w-4" />
      {loading ? "Connecting..." : label}
    </button>
  );
}

export default function SocialLoginButtons({ onGitHub, onGoogle }: Props) {
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGitHubLogin = async () => {
    setLoadingGitHub(true);
    try {
      // Redirect to backend GitHub OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      window.location.href = `${backendUrl}/api/auth/github`;
    } catch (error) {
      console.error("GitHub login error:", error);
      setLoadingGitHub(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      // Redirect to backend Google OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error) {
      console.error("Google login error:", error);
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SocialButton 
        icon={GitBranch} 
        label="Continue with GitHub" 
        onClick={handleGitHubLogin}
        loading={loadingGitHub}
      />
      <SocialButton 
        icon={Globe2} 
        label="Continue with Google" 
        onClick={handleGoogleLogin}
        loading={loadingGoogle}
      />
    </div>
  );
}
