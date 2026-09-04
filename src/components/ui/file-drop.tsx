import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle2, XCircle, Loader2, X } from "lucide-react";
import { UploadedFile } from "@/types";
import { cn } from "@/lib/utils";

interface FileDropProps {
  label: string;
  sessionId: string;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

type FileState = {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = "uploads";

/**
 * Uploads a file directly to Supabase Storage's REST endpoint via XHR (instead
 * of the supabase-js client) so we get real byte-level progress events for the
 * animated progress bar — the JS client's fetch-based upload doesn't expose those.
 */
function uploadWithProgress(
  path: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "true");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`);
      } else {
        reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function FileDrop({
  label,
  sessionId,
  accept = "image/*,application/pdf",
  maxSizeMB = 10,
  multiple = true,
  value,
  onChange,
}: FileDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [inFlight, setInFlight] = useState<FileState[]>([]);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      Array.from(fileList).forEach(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        if (file.size > maxSizeMB * 1024 * 1024) {
          setInFlight((prev) => [
            ...prev,
            { id, name: file.name, progress: 0, status: "error", error: `Max ${maxSizeMB}MB` },
          ]);
          return;
        }

        setInFlight((prev) => [...prev, { id, name: file.name, progress: 0, status: "uploading" }]);

        const path = `${sessionId}/${Date.now()}-${file.name}`;

        try {
          const url = await uploadWithProgress(path, file, (pct) => {
            setInFlight((prev) => prev.map((f) => (f.id === id ? { ...f, progress: pct } : f)));
          });
          setInFlight((prev) => prev.map((f) => (f.id === id ? { ...f, status: "done", progress: 100 } : f)));
          onChange([...value, { name: file.name, url, type: file.type, size: file.size }]);
          setTimeout(() => {
            setInFlight((prev) => prev.filter((f) => f.id !== id));
          }, 1200);
        } catch {
          setInFlight((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: "error", error: "Upload failed" } : f))
          );
        }
      });
    },
    [sessionId, value, onChange, maxSizeMB]
  );

  const removeUploaded = (url: string) => {
    onChange(value.filter((f) => f.url !== url));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>

      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        animate={{
          scale: dragging ? 1.02 : 1,
          borderColor: dragging ? "rgb(99 102 241)" : "rgb(229 229 229)",
        }}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          "bg-gradient-to-b from-neutral-50 to-white hover:from-indigo-50/40 hover:to-white"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <motion.div
          animate={{ y: dragging ? -4 : 0 }}
          className="flex flex-col items-center gap-2 text-neutral-500"
        >
          <UploadCloud className="w-8 h-8 text-indigo-500" />
          <p className="text-sm font-medium text-neutral-700">Click or drag files here to upload</p>
          <p className="text-xs text-neutral-400">Images or PDF, up to {maxSizeMB}MB each</p>
        </motion.div>
      </motion.div>

      {/* In-flight uploads with animated progress */}
      <AnimatePresence>
        {inFlight.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-xl border border-neutral-200 p-3 overflow-hidden"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="truncate max-w-[70%] text-neutral-700">{f.name}</span>
              {f.status === "uploading" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
              {f.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {f.status === "error" && <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            {f.status !== "error" ? (
              <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-indigo-500 bg-[length:200%_100%]"
                  style={{ width: `${f.progress}%` }}
                  animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : (
              <p className="text-xs text-red-500">{f.error}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Successfully uploaded files */}
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((file) => (
            <motion.div
              key={file.url}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-full pl-3 pr-1 py-1 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUploaded(file.url);
                }}
                className="p-0.5 rounded-full hover:bg-green-100"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
