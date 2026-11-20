import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AtSign,
  BadgeCheck,
  Briefcase,
  Building2,
  Hash,
  LogOut,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  School,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { CardBox, CustomButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import defaultAvatar from "@/assets/images/default-avatar.svg";

/* ─── Small pieces ────────────────────────────────────────────── */

const show = (value: unknown) =>
  value === undefined || value === null || String(value).trim() === ""
    ? "—"
    : String(value);

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: unknown;
  mono?: boolean;
}> = ({ icon, label, value, mono }) => (
  <div className="flex items-start gap-3 py-3 border-b last:border-0 border-slate-100 dark:border-slate-800/70">
    <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 dark:text-slate-200 break-words ${
          mono ? "font-mono" : ""
        }`}>
        {show(value)}
      </p>
    </div>
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; tone?: "indigo" | "emerald" | "slate" }> = ({
  children,
  tone = "slate",
}) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${tones[tone]}`}>
      {children}
    </span>
  );
};

/* ─── Page ────────────────────────────────────────────────────── */

export const ProfilePage: React.FC = () => {
  const { user, reloadUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadUser();
      toast.success("Profile refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh profile");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Profile Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your account details from the university system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => void handleRefresh()}
            isLoading={isRefreshing}>
            Refresh
          </CustomButton>
          <CustomButton
            variant="danger"
            size="sm"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            onClick={handleSignOut}>
            Sign Out
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <CardBox className="lg:col-span-1" bodyClassName="p-6">
          <div className="flex flex-col items-center text-center gap-3">
            <img
              src={defaultAvatar}
              alt={user.fullname}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/15 shadow-sm"
            />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {show(user.fullname)}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {show(user.designation)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{show(user.department)}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              <Chip tone="indigo">
                <AtSign className="w-3 h-3" />
                {user.username}
              </Chip>
              {user.user_role && (
                <Chip tone="emerald">
                  <ShieldCheck className="w-3 h-3" />
                  {user.user_role}
                </Chip>
              )}
              {user.shortname && <Chip>{user.shortname}</Chip>}
            </div>
          </div>
        </CardBox>

        {/* Details */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardBox
            title="Contact"
            icon={<Mail className="w-4 h-4 text-indigo-500" />}
            bodyClassName="px-5 py-1">
            <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={user.email} />
            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Mobile" value={user.mobile} mono />
            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address" value={user.address} />
            <InfoRow icon={<UserRound className="w-3.5 h-3.5" />} label="Gender" value={user.gender} />
          </CardBox>

          <CardBox
            title="Academic"
            icon={<Building2 className="w-4 h-4 text-emerald-500" />}
            bodyClassName="px-5 py-1">
            <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Department" value={user.department} />
            <InfoRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Designation" value={user.designation} />
            <InfoRow icon={<School className="w-3.5 h-3.5" />} label="Varsity" value={user.varsity} />
            <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Short Name" value={user.shortname} />
          </CardBox>

          <CardBox
            title="Account"
            icon={<BadgeCheck className="w-4 h-4 text-sky-500" />}
            className="md:col-span-2"
            bodyClassName="px-5 py-1">
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8">
              <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="User ID" value={user.id} mono />
              <InfoRow icon={<AtSign className="w-3.5 h-3.5" />} label="Username" value={user.username} mono />
              <InfoRow icon={<ShieldCheck className="w-3.5 h-3.5" />} label="User Role" value={user.user_role} />
              <InfoRow icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Account Type" value={user.acctype} />
              <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Department ID" value={user.tbl_department_id} mono />
              <InfoRow icon={<Hash className="w-3.5 h-3.5" />} label="Priority" value={user.priority} mono />
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
