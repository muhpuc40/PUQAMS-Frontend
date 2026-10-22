import React, { useEffect, useRef } from 'react';
import $ from '@/lib/jquery'; // sets window.$ / window.jQuery before the plugin loads
import 'summernote/dist/summernote-lite.min.css';
import 'summernote/dist/summernote-lite.min.js';

export interface SummernoteProps {
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  height?: number | string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Summernote: React.FC<SummernoteProps> = ({
  label,
  helperText,
  error,
  value,
  defaultValue = '<p>Welcome to <strong>Summernote (npm)</strong> WYSIWYG editor! Powered by the official <code>summernote</code> package with full rich-text toolbar capabilities.</p>',
  onChange,
  placeholder = 'Write content here...',
  height = 220,
  disabled = false,
  fullWidth = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const parsedHeight =
      typeof height === 'number' ? height : parseInt(height as string, 10) || 220;

    const $editor = ($(editorRef.current) as any);

    // Initialize Summernote using official npm package API
    $editor.summernote({
      placeholder: placeholder,
      height: parsedHeight,
      dialogsInBody: true,
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'picture', 'video', 'hr']],
        ['view', ['fullscreen', 'codeview', 'help']],
      ],
      callbacks: {
        onChange: (contents: string) => {
          if (!isInternalChangeRef.current) {
            onChange?.(contents);
          }
        },
      },
    });

    // Set initial content
    const initialContent = value !== undefined ? value : defaultValue;
    if (initialContent) {
      $editor.summernote('code', initialContent);
    }

    if (disabled) {
      $editor.summernote('disable');
    }

    return () => {
      try {
        $editor.summernote('destroy');
      } catch (err) {
        // Safe unmount
      }
    };
  }, []);

  // Update content if value prop changes from parent outside
  useEffect(() => {
    if (!editorRef.current) return;
    const $editor = ($(editorRef.current) as any);
    try {
      const currentVal = $editor.summernote('code');
      if (value !== undefined && value !== currentVal) {
        isInternalChangeRef.current = true;
        $editor.summernote('code', value);
        isInternalChangeRef.current = false;
      }
    } catch {
      // Ignore if editor not ready
    }
  }, [value]);

  // Handle disabled state changes
  useEffect(() => {
    if (!editorRef.current) return;
    const $editor = ($(editorRef.current) as any);
    try {
      if (disabled) {
        $editor.summernote('disable');
      } else {
        $editor.summernote('enable');
      }
    } catch {
      // Ignore if editor not ready
    }
  }, [disabled]);

  return (
    <div
      ref={containerRef}
      className={`summernote-npm-wrapper flex flex-col gap-1.5 ${
        fullWidth ? 'w-full' : 'inline-flex'
      } ${className}`}
    >
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[11px] font-normal text-slate-400">Summernote (npm)</span>
        </label>
      )}

      <div
        className={`rounded-xl overflow-hidden transition-all duration-150 ${
          error
            ? 'ring-2 ring-rose-500/30 border border-rose-500'
            : 'border border-slate-200 dark:border-slate-700'
        }`}
      >
        <textarea ref={editorRef} defaultValue={value || defaultValue} className="hidden" />
      </div>

      {(error || helperText) && (
        <div className="text-[11px] leading-tight mt-0.5">
          {error ? (
            <span className="text-rose-500 font-medium">{error}</span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Summernote;
