import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Music, X, FileAudio } from 'lucide-react';

interface AudioDropzoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

export const AudioDropzone: React.FC<AudioDropzoneProps> = ({
  selectedFile,
  onFileSelect,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format file size in MB
  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Drag Event Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  // Click & File Picker Handlers
  const handleClick = () => {
    if (!disabled && !selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="audio/mpeg, audio/wav, audio/x-wav, .mp3, .wav"
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Area Container */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed
          transition-all duration-200 ease-in-out cursor-pointer
          ${
            disabled
              ? 'bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed'
              : selectedFile
              ? 'bg-zinc-900 border-indigo-500/50'
              : isDragOver
              ? 'bg-indigo-950/30 border-indigo-500 scale-[1.01]'
              : 'bg-zinc-900/80 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
          }
        `}
      >
        {selectedFile ? (
          /* Selected File View */
          <div className="flex items-center justify-between w-full p-4 rounded-lg bg-zinc-800/80 border border-zinc-700">
            <div className="flex items-center space-x-4 truncate">
              <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                <FileAudio className="w-8 h-8" />
              </div>
              <div className="truncate text-left">
                <p className="text-sm font-medium text-zinc-100 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={disabled}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 rounded-lg transition-colors ml-4"
              title="Change File"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Idle / Dragging View */
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`p-4 rounded-full transition-colors ${
                isDragOver
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {isDragOver ? (
                <Music className="w-8 h-8 animate-bounce" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-zinc-200">
                {isDragOver ? (
                  <span className="text-indigo-400">Drop your track here</span>
                ) : (
                  <>
                    Drag & drop your audio file or{' '}
                    <span className="text-indigo-400 hover:underline">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-zinc-400">
                Supports MP3, WAV (Up to 15MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};