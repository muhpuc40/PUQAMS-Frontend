import React, { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react";
import { CardBox, CustomButton, SpinLoader } from "@/components/ui";
import { useToast } from "@/contexts/ToastContext";
import {
  getHealth,
  type HealthResponse,
  type HealthApiInfo,
  type HealthDatabaseInfo,
  type HealthMemoryInfo,
  type HealthStorageInfo,
} from "@/services/healthService";

/* ─── Helpers ────────────────────────────────────────────── */

const Stat: React.FC<{
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}> = ({ label, value, mono }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
    </span>
    <span
      className={`text-xs text-slate-800 dark:text-slate-200 ${
        mono ? "font-mono tabular-nums" : ""
      }`}>
      {value}
    </span>
  </div>
);

const ProgressBar: React.FC<{
  percent: number;
  danger?: number;
  warn?: number;
}> = ({ percent, danger = 90, warn = 70 }) => {
  const clamped = Math.min(100, Math.max(0, percent));
  const color =
    clamped >= danger
      ? "bg-rose-500"
      : clamped >= warn
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

/* ─── Status badge ───────────────────────────────────────── */

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase() ?? "";
  const healthy = s === "healthy" || s === "connected" || s === "up";
  const unhealthy = s === "unhealthy" || s === "disconnected" || s === "down";

  const Icon = healthy ? CheckCircle2 : unhealthy ? XCircle : AlertTriangle;
  const classes = healthy
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
    : unhealthy
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${classes}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
};

/* ─── Page ───────────────────────────────────────────────── */

export const ServerHealthPage: React.FC = () => {
  const { toast } = useToast();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const load = async (showToast = false) => {
    setIsLoading(true);
    try {
      const data = await getHealth();
      setHealth(data);
      setLastFetched(new Date());
      if (showToast) toast.success("Health check refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to load health status");
      setHealth(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: HealthApiInfo | undefined = health?.api;
  const memory: HealthMemoryInfo | undefined = health?.memory;
  const storage: HealthStorageInfo | undefined = health?.storage;
  const database: HealthDatabaseInfo | undefined = health?.database;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Server Health
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live status of the PUQAMS API, database, and host machine
            {lastFetched && (
              <>
                {" · "}
                <span className="font-mono tabular-nums">
                  {lastFetched.toLocaleTimeString()}
                </span>
              </>
            )}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => load(true)}
          isLoading={isLoading}>
          Refresh
        </CustomButton>
      </div>

      {/* Loading / Error / Content */}
      {isLoading && !health ? (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <SpinLoader size="lg" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Contacting health endpoint...
            </p>
          </div>
        </CardBox>
      ) : !health ? (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500">
              <XCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Could not reach the health endpoint.
            </p>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => load(true)}>
              Retry
            </CustomButton>
          </div>
        </CardBox>
      ) : (
        <>
          {/* Overall Status */}
          <CardBox
            title="Overall Status"
            subtitle={health.message}
            icon={<Activity className="w-4 h-4 text-emerald-500" />}
            headerAction={<StatusBadge status={health.status} />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat
                label="Check Duration"
                value={`${health.healthCheckDurationMs} ms`}
                mono
              />
              <Stat
                label="Timestamp (UTC)"
                value={new Date(health.timestampUtc).toLocaleString()}
                mono
              />
              <Stat label="API" value={health.api.name} />
              <Stat label="Environment" value={health.api.environment} mono />
            </div>
          </CardBox>

          {/* Two-column dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Card */}
            <CardBox
              title="API"
              subtitle={`${api?.name} · v${api?.version}`}
              icon={<Server className="w-4 h-4 text-indigo-500" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Stat label="Environment" value={api?.environment} mono />
                <Stat
                  label="Framework"
                  value={`.NET ${api?.frameworkVersion}`}
                  mono
                />
                <Stat label="Machine" value={api?.machineName} mono />
                <Stat label="OS" value={api?.operatingSystem} mono />
                <Stat label="Processors" value={api?.processorCount} mono />
                <Stat
                  label="Architecture"
                  value={
                    api?.is64BitOperatingSystem
                      ? api?.is64BitProcess
                        ? "64-bit (OS & process)"
                        : "64-bit OS / 32-bit process"
                      : "32-bit"
                  }
                />
                <Stat
                  label="Started (UTC)"
                  value={
                    api
                      ? new Date(api.processStartedAtUtc).toLocaleString()
                      : "—"
                  }
                  mono
                />
                <Stat label="Uptime" value={api?.processUptime} mono />
              </div>
            </CardBox>

            {/* Database Card */}
            <CardBox
              title="Database"
              subtitle={`${database?.provider} · ${database?.server}`}
              icon={<Database className="w-4 h-4 text-sky-500" />}
              headerAction={
                database ? <StatusBadge status={database.status} /> : undefined
              }>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Stat
                  label="Database Name"
                  value={database?.databaseName}
                  mono
                />
                <Stat label="Server" value={database?.server} mono />
                <Stat label="Provider" value={database?.provider} mono />
                <Stat
                  label="Response Time"
                  value={`${database?.responseTimeMs} ms`}
                  mono
                />
              </div>

              {database?.error && (
                <div className="mt-4 rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 mb-0.5">
                        Database Error
                      </p>
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 break-words">
                        {database.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardBox>

            {/* Memory Card */}
            <CardBox
              title="Memory"
              subtitle="Process and system RAM usage"
              icon={<MemoryStick className="w-4 h-4 text-emerald-500" />}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      API Process
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {memory?.apiProcessUsedMb.toFixed(2)} MB /{" "}
                      {memory?.totalAvailableToProcessMb.toFixed(0)} MB
                    </span>
                  </div>
                  <ProgressBar
                    percent={
                      memory
                        ? (memory.apiProcessUsedMb /
                            memory.totalAvailableToProcessMb) *
                          100
                        : 0
                    }
                    warn={60}
                    danger={85}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Stat
                    label="Managed Heap"
                    value={`${memory?.managedHeapUsedMb.toFixed(2)} MB`}
                    mono
                  />
                  <Stat
                    label="Total Available"
                    value={`${memory?.totalAvailableToProcessGb.toFixed(2)} GB`}
                    mono
                  />
                  <Stat
                    label="Installed RAM"
                    value={`${memory?.hardware.totalInstalledGb} GB`}
                    mono
                  />
                </div>
              </div>
            </CardBox>

            {/* Storage Card */}
            <CardBox
              title="Storage"
              subtitle={`${storage?.drive} ${storage?.volumeLabel ? `· ${storage.volumeLabel}` : ""}`}
              icon={<HardDrive className="w-4 h-4 text-amber-500" />}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Disk Usage
                    </span>
                    <span className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
                      {storage?.usedGb.toFixed(2)} /{" "}
                      {storage?.totalGb.toFixed(2)} GB
                    </span>
                  </div>
                  <ProgressBar percent={storage?.usedPercentage ?? 0} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Stat
                    label="Available"
                    value={`${storage?.availableGb.toFixed(2)} GB`}
                    mono
                  />
                  <Stat
                    label="Used %"
                    value={`${storage?.usedPercentage.toFixed(2)}%`}
                    mono
                  />
                  <Stat label="File System" value={storage?.fileSystem} mono />
                  <Stat label="Drive Type" value={storage?.driveType} />
                  <Stat
                    label="Volume Label"
                    value={storage?.volumeLabel || "—"}
                  />
                </div>
              </div>
            </CardBox>
          </div>

          {/* Hardware Modules */}
          {memory?.hardware.available && memory.hardware.modules.length > 0 && (
            <CardBox
              title="Memory Modules"
              subtitle={`${memory.hardware.moduleCount} module${memory.hardware.moduleCount !== 1 ? "s" : ""} · ${memory.hardware.totalInstalledGb} GB total`}
              icon={<Cpu className="w-4 h-4 text-purple-500" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Manufacturer</th>
                      <th className="py-2.5 px-3">Part Number</th>
                      <th className="py-2.5 px-3 text-center">Capacity</th>
                      <th className="py-2.5 px-3 text-center">Configured</th>
                      <th className="py-2.5 px-3 text-center">Rated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                    {memory.hardware.modules.map((mod, idx) => (
                      <tr key={`${mod.location}-${idx}`}>
                        <td className="py-2.5 px-3 font-medium">
                          {mod.location}
                        </td>
                        <td className="py-2.5 px-3">{mod.manufacturer}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          {mod.partNumber}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          {mod.capacityGb} GB
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          {mod.configuredClockSpeedMhz} MHz
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                          {mod.hardwareSpeedMhz} MHz
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBox>
          )}
        </>
      )}
    </div>
  );
};

export default ServerHealthPage;
