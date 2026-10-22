import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight } from "lucide-react";
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

  if (!isBootstrapping && isAuthenticated) {
    const redirectTo = (location.state as LocationState)?.from?.pathname || "/";
    return <Navigate to={redirectTo} replace />;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!departmentId) e.department = "Please select a department";
    if (!username.trim()) e.username = "Username is required";
    if (!password.trim()) e.password = "Password is required";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-950">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left: brand */}
        <div className="hidden lg:flex flex-col items-center justify-center p-10 text-center">
          <img
            src={puLogo}
            alt="Premier University"
            className="w-32 h-32 object-contain"
          />
          <h1 className="text-3xl font-bold text-white tracking-tight mt-6">
            Premier University
          </h1>
          <p className="text-sm text-indigo-100/90 mt-2">
            Question Authoring Management System
          </p>
        </div>

        {/* Right: login card */}
        <div className="flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            {/* Mobile-only brand */}
            <div className="flex flex-col items-center mb-6 lg:hidden">
              <img
                src={puLogo}
                alt="Premier University"
                className="w-20 h-20 object-contain"
              />
              <h1 className="text-lg font-bold text-white mt-3">
                Premier University
              </h1>
              <p className="text-xs text-indigo-100/90 mt-0.5">
                Question Authoring Management System
              </p>
            </div>

            <CardBox
              title="Sign in to your account"
              subtitle="Select your department, then enter your credentials">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select2
                  label="Department"
                  placeholder="Select your department"
                  options={departments}
                  value={departmentId}
                  onChange={(v) => setDepartmentId(v as string)}
                  error={errors.department}
                  disabled={isLoadingDepts}
                  isSearchable
                  isClearable={false}
                />

                <TextInput
                  label="Username"
                  placeholder="e.g. admin_cse"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.username}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
