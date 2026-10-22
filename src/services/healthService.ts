import apiClient from '@/Axios/axiosConfig';

export interface HealthApiInfo {
    name: string;
    version: string;
    environment: string;
    machineName: string;
    operatingSystem: string;
    frameworkVersion: string;
    processorCount: number;
    is64BitOperatingSystem: boolean;
    is64BitProcess: boolean;
    processStartedAtUtc: string;
    processUptime: string;
}

export interface MemoryModule {
    location: string;
    manufacturer: string;
    partNumber: string;
    capacityGb: number;
    configuredClockSpeedMhz: number;
    hardwareSpeedMhz: number;
}

export interface HealthMemoryInfo {
    apiProcessUsedMb: number;
    managedHeapUsedMb: number;
    totalAvailableToProcessMb: number;
    totalAvailableToProcessGb: number;
    hardware: {
        available: boolean;
        totalInstalledGb: number;
        moduleCount: number;
        modules: MemoryModule[];
    };
}

export interface HealthStorageInfo {
    available: boolean;
    drive: string;
    volumeLabel: string;
    driveType: string;
    fileSystem: string;
    totalGb: number;
    usedGb: number;
    availableGb: number;
    usedPercentage: number;
}

export interface HealthDatabaseInfo {
    status: string;
    provider: string;
    databaseName: string;
    server: string;
    responseTimeMs: number;
    error: string | null;
}

export interface HealthResponse {
    success: boolean;
    status: string;
    message: string;
    api: HealthApiInfo;
    memory: HealthMemoryInfo;
    storage: HealthStorageInfo;
    database: HealthDatabaseInfo;
    healthCheckDurationMs: number;
    timestampUtc: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>('v1/Health');
    return data;
};