import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';

interface AudioFileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

export const AudioFileUploader: React.FC<AudioFileUploaderProps> = ({ onFileSelect }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Formatear el tamaño del archivo a KB o MB
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFile = (selectedFile: File | undefined) => {
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile);
      if (onFileSelect) onFileSelect(selectedFile);
    } else if (selectedFile) {
      alert('Por favor, selecciona un archivo de audio válido.');
    }
  };

  // Manejadores de Drag & Drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  // Manejadores de entrada manual
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    handleFile(selectedFile);
  };

  const handleContainerClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept="audio/*"
        className="hidden"
      />

      <div
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
            : file
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        }`}
      >
        {!file ? (
          <div className="text-center">
            <svg
              className={`w-12 h-12 mx-auto mb-3 transition-colors ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12 0c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              Arrastra y suelta tu archivo de audio aquí
            </p>
            <p className="text-xs text-gray-500 mt-1">o haz clic para explorar en tu equipo</p>
          </div>
        ) : (
          <div className="w-full text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 truncate px-2">{file.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>

            <button
              type="button"
              onClick={handleRemoveFile}
              className="mt-4 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors shadow-sm"
            >
              Cambiar archivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};