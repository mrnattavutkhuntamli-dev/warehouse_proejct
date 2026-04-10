import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Warehouse, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email:    z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPwd, setShowPwd] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email:    "somchai@example.com",
      password: "password123",
    },
  });

  const onSubmit = (data) => login(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[var(--color-brand)] opacity-[0.03] blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm mx-4 animate-fade-in">
        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-brand)] to-transparent mb-8 opacity-60" />

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 shadow-[0_20px_60px_-15px_rgb(0_0_0_/_0.8)]">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-brand)] flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-[var(--color-text-inverse)]" />
            </div>
            <div>
              <p className="text-base font-bold text-[var(--color-text-primary)] font-[var(--font-display)] leading-none">
                WarehouseOS
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] font-mono">
                Warehouse Management System
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              กรอกข้อมูลของคุณเพื่อเข้าใช้งาน
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase font-mono">
                อีเมล
              </label>
              <Input
                type="email"
                placeholder="somchai@example.com"
                prefix={<Mail className="w-3.5 h-3.5" />}
                error={errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-[var(--color-danger)]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide uppercase font-mono">
                รหัสผ่าน
              </label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  prefix={<Lock className="w-3.5 h-3.5" />}
                  error={errors.password}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {showPwd
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-[var(--color-danger)]">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={isLoggingIn}
            >
              {isLoggingIn ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <p className="text-[11px] text-[var(--color-text-muted)] font-mono text-center leading-relaxed">
              Demo: somchai@example.com / password123
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-border-strong)] to-transparent mt-8 opacity-60" />
      </div>
    </div>
  );
}
