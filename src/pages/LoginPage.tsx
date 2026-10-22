import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, User, Building2, ArrowRight } from "lucide-react";
import {
  CardBox,
  CustomButton,
  Select2,
  TextInput,
  Preloader,
  type Select2Option,
} from "@/components/ui";
import puLogo from "@/assets/puc.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getDepartments } from "@/services/departmentService";

interface LocationState {
  from?: { pathname?: string };
}

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<Select2Option[]>([]);
  const [isLoadingDepts, setIsLoadingDepts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments for the select
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getDepartments();
        setDepartments(
          list.map((d) => ({
            value: String(d.id),
            label: d.name,
            description: d.code,
          })),
        );
      } catch (err) {
        toast.error((err as Error).message || "Failed to load departments");
      } finally {
        setIsLoadingDepts(false);
      }
    };
    void load();
  }, [toast]);

  // Already logged in → bounce
  if (!isBootstrapping && isAuthenticated) {
    const redirectTo = (location.state as LocationState)?.from?.pathname || "/";
    return <Navigate to={redirectTo} replace />;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
    if (!departmentId) e.department = "Please select a department";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login({
        username: username.trim(),
        password,
        department_id: Number(departmentId),
      });
      toast.success("Welcome back!");
      const redirectTo =
        (location.state as LocationState)?.from?.pathname || "/";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid username, password or department";
      toast.error(msg, { title: "Login failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBootstrapping) {
    return (
      <Preloader
        isLoading
        message="Checking session"
        subMessage="Please wait..."
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-sm">
            <img
              src={puLogo}
              alt="Premier University"
              className="w-full h-full object-contain p-1.5"
            />
          </div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-3">
            Premier University
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Question Authoring Management System
          </p>
        </div>

        <CardBox
          title="Sign in to your account"
          subtitle="Enter your credentials and select your department">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Username"
              placeholder="e.g. admin_cse"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              error={errors.username}
              autoFocus
              autoComplete="username"
            />

            <TextInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password}
              autoComplete="current-password"
            />

            <Select2
              label="Department"
              placeholder={
                isLoadingDepts
                  ? "Loading departments..."
                  : "Select your department"
              }
              options={departments}
              value={departmentId}
              onChange={(v) => setDepartmentId(v as string)}
              error={errors.department}
              disabled={isLoadingDepts}
              isSearchable
              isClearable={false}
            />

            <CustomButton
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isSubmitting}
              loadingText="Signing in..."
              rightIcon={<ArrowRight className="w-4 h-4" />}>
              Sign In
            </CustomButton>
          </form>
        </CardBox>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          © {new Date().getFullYear()} Premier University · v1.0.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
