import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Shield, Mail, Phone, Building2, Key,
  Eye, EyeOff, CheckCircle2, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormRow, FormSection, FormActions } from "@/components/common/FormField";
import { useProfile, useChangePassword } from "@/services/usersService";
import { useAuditLogs } from "@/services/auditService";
import { formatDate, formatDateTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import useAuthStore from "@/store/authStore";

const pwdSchema = z.object({
  currentPassword: z.string().min(1, "กรุณากรอกรหัสผ่านเดิม"),
  newPassword:     z.string().min(8, "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

const ROLE_LABEL = {
  ADMIN:   { label: "Admin",   cls: "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]" },
  MANAGER: { label: "Manager", cls: "bg-[var(--color-info-subtle)] text-[var(--color-info)]" },
  STAFF:   { label: "Staff",   cls: "bg-[var(--color-success-subtle)] text-[var(--color-success)]" },
  VIEWER:  { label: "Viewer",  cls: "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]" },
};

export default function ProfilePage() {
  const { user: storeUser } = useAuthStore();
  const { data: profile, isLoading } = useProfile();
  const { data: myLogs } = useAuditLogs({
    userId: storeUser?.id, limit: 5, page: 1,
  });

  const user = profile ?? storeUser;
  const roleCfg = ROLE_LABEL[user?.role] ?? ROLE_LABEL.VIEWER;

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="โปรไฟล์" subtitle="ข้อมูลบัญชีของคุณ" />

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-8 rounded" />)}
            </div>
          ) : (
            <div className="flex items-start gap-5">
              {/* Large avatar */}
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-subtle)] flex items-center justify-center shrink-0 text-2xl font-bold text-[var(--color-brand)]">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{user?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold font-mono",
                      roleCfg.cls
                    )}>
                      <Shield className="w-3 h-3" />{roleCfg.label}
                    </span>
                    <span className="text-xs font-mono text-[var(--color-brand)]">
                      {user?.employeeCode}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <InfoRow icon={Mail}     label="อีเมล"   value={user?.email} />
                  <InfoRow icon={Phone}    label="โทร"     value={user?.phone || "—"} />
                  <InfoRow icon={Building2} label="แผนก"   value={user?.department?.name || "—"} />
                  <InfoRow icon={Clock}    label="เข้าร่วม" value={formatDate(user?.createdAt)} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <ChangePasswordCard />

      {/* Recent activity */}
      {myLogs?.data?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-brand)]" />
              กิจกรรมล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myLogs.data.map((log) => (
                <div key={log.id}
                  className="flex items-center gap-3 py-2 border-b border-[var(--color-border)] last:border-0">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0",
                    log.action === "CREATE" ? "bg-[var(--color-success-subtle)] text-[var(--color-success)]" :
                    log.action === "DELETE" ? "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]" :
                    "bg-[var(--color-info-subtle)] text-[var(--color-info)]"
                  )}>
                    {log.action}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] flex-1 truncate">
                    {log.entity} · {log.description ?? log.entityId?.slice(0,8)}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
      <span className="text-[var(--color-text-muted)]">{label}:</span>
      <span className="text-[var(--color-text-secondary)] truncate">{value}</span>
    </div>
  );
}

function ChangePasswordCard() {
  const changePwdMutation = useChangePassword();
  const [showPwd, setShowPwd] = useState({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(pwdSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    await changePwdMutation.mutateAsync({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
    });
    reset();
  };

  const toggle = (field) => setShowPwd(p => ({ ...p, [field]: !p[field] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[var(--color-brand)]" />
          เปลี่ยนรหัสผ่าน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: "currentPassword", label: "รหัสผ่านเดิม" },
            { name: "newPassword",     label: "รหัสผ่านใหม่" },
            { name: "confirmPassword", label: "ยืนยันรหัสผ่านใหม่" },
          ].map(({ name, label }) => (
            <FormField key={name} label={label} error={errors[name]?.message} required>
              <div className="relative">
                <Input
                  type={showPwd[name] ? "text" : "password"}
                  placeholder="••••••••"
                  error={errors[name]}
                  {...register(name)}
                />
                <button type="button"
                  onClick={() => toggle(name)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
                  {showPwd[name]
                    ? <EyeOff className="w-3.5 h-3.5" />
                    : <Eye    className="w-3.5 h-3.5" />}
                </button>
              </div>
            </FormField>
          ))}

          <div className="pt-1">
            <Button type="submit" loading={changePwdMutation.isPending} className="w-full sm:w-auto">
              <Key className="w-3.5 h-3.5" />
              เปลี่ยนรหัสผ่าน
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
