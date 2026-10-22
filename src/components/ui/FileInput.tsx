import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  FileArchive,
} from 'lucide-react';
import CustomButton from './CustomButton';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  progress?: number;
  error?: string;
}

export interface FileInputProps {
  label?: string;
  helperText?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  maxFiles?: number;
  disabled?: boolean;
  variant?: 'dropzone' | 'button' | 'compact';
  value?: File[] | UploadedFile[];
  onChange?: (files: File[]) => void;
  onRemove?: (fileId: string) => void;
  fullWidth?: boolean;
  className?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  label,
  helperText,
  error: customError,
  accept = '*/*',
  multiple = true,
  maxSizeMB = 10,
  maxFiles = 5,
  disabled = false,
  variant = 'dropzone',
  onChange,
  onRemove,
  fullWidth = true,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileList, setFileList] = useState<UploadedFile[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />;
    if (type.includes('pdf') || type.includes('word') || type.includes('text')) {
      return <FileText className="w-4 h-4 text-indigo-500 shrink-0" />;
    }
    if (type.includes('zip') || type.includes('tar') || type.includes('compressed')) {
      return <FileArchive className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    return <File className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0 || disabled) return;
    setValidationError(null);

    const newFiles: UploadedFile[] = [];
    const validRawFiles: File[] = [];

    if (!multiple && incomingFiles.length > 1) {
      setValidationError('Only a single file can be selected.');
      return;
    }

    if (fileList.length + incomingFiles.length > maxFiles) {
      setValidationError(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    Array.from(incomingFiles).forEach((file) => {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setValidationError(`"${file.name}" exceeds maximum allowed size of ${maxSizeMB}MB.`);
        return;
      }

      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      let previewUrl: string | undefined = undefined;

      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      newFiles.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        progress: 100,
      });

      validRawFiles.push(file);
    });

    if (newFiles.length > 0) {
      const updated = multiple ? [...fileList, ...newFiles] : newFiles;
      setFileList(updated);
      onChange?.(updated.map((u) => u.file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetFile = fileList.find((f) => f.id === fileId);
    if (targetFile?.previewUrl) {
      URL.revokeObjectURL(targetFile.previewUrl);
    }
    const updated = fileList.filter((f) => f.id !== fileId);
    setFileList(updated);
    onRemove?.(fileId);
    onChange?.(updated.map((u) => u.file));
  };

  const activeError = customError || validationError;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[11px] font-normal text-slate-400">
            Max {maxSizeMB}MB {multiple ? `· Up to ${maxFiles} files` : ''}
          </span>
        </label>
      )}

      {/* Hidden file input element */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      {/* Dropzone Style */}
      {variant === 'dropzone' && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all duration-150 cursor-pointer select-none ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
              : activeError
              ? 'border-rose-400 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/70'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            <span className="text-indigo-600 dark:text-indigo-400 hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Supports {accept === '*/*' ? 'all formats' : accept} up to {maxSizeMB}MB
          </p>
        </div>
      )}

      {/* Compact / Button Variant */}
      {variant === 'compact' && (
        <div className="flex items-center gap-3">
          <CustomButton
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            leftIcon={<UploadCloud className="w-4 h-4 text-indigo-500" />}
            onClick={() => fileInputRef.current?.click()}
          >
            Browse Files...
          </CustomButton>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {fileList.length === 0 ? 'No files selected' : `${fileList.length} file(s) selected`}
          </span>
        </div>
      )}

      {/* Error or helper text */}
      {(activeError || helperText) && (
        <div className="text-[11px] leading-tight">
          {activeError ? (
            <span className="text-rose-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {activeError}
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
          )}
        </div>
      )}

      {/* Uploaded File Previews */}
      {fileList.length > 0 && (
        <div className="space-y-2 mt-1">
          {fileList.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs text-xs transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {fileItem.previewUrl ? (
                  <img
                    src={fileItem.previewUrl}
                    alt={fileItem.name}
                    className="w-9 h-9 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getFileIcon(fileItem.type)}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {fileItem.name}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {formatFileSize(fileItem.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-emerald-500" title="Ready to upload">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFile(fileItem.id, e)}
                    aria-label={`Remove ${fileItem.name}`}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileInput;
