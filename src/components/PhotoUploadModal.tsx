import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { MathView } from './MathView.js';
import type { MathProblem } from '../types.js';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemConfirmed: (problem: MathProblem, thumbnail?: string) => void;
}

export function PhotoUploadModal({
  isOpen,
  onClose,
  onProblemConfirmed,
}: PhotoUploadModalProps) {
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedProblem, setExtractedProblem] = useState<MathProblem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    setErrorMsg(null);
    setExtractedProblem(null);
    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);
      const base64 = result.split(',')[1];
      setSelectedImageBase64(base64);
      // Auto analyze once image is loaded
      analyzeImage(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const analyzeImage = async (base64: string, mime: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: mime,
        }),
      });

      if (!res.ok) {
        throw new Error('Could not analyze the photo. Please ensure math is clearly legible.');
      }

      const data = await res.json();

      if (data.isReadable === false) {
        throw new Error(data.unreadableReason || 'The equation could not be clearly read. Please try a clearer photo.');
      }

      const problem: MathProblem = {
        id: 'photo_prob_' + Date.now(),
        rawInput: data.plainText || data.latex,
        latex: data.latex,
        subject: data.subject || 'algebra',
        topic: data.topic || 'Math Problem',
        difficulty: data.difficulty || 'intermediate',
        suggestedStepsCount: data.suggestedStepsCount || 4,
      };

      setExtractedProblem(problem);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to read image. Please retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStart = () => {
    if (extractedProblem) {
      onProblemConfirmed(extractedProblem, imagePreviewUrl || undefined);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedImageBase64(null);
    setImagePreviewUrl(null);
    setExtractedProblem(null);
    setErrorMsg(null);
    setIsAnalyzing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Upload Math Photo
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            id="close-photo-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileChange}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-stone-800 dark:text-stone-200">
          {!imagePreviewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center gap-4 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-stone-50/50 dark:bg-stone-950/40'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Click to browse or drag & drop photo
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Supports handwritten equations, textbooks, worksheets (PNG, JPG)
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Live Photo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview & Change */}
              <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 flex items-center justify-center max-h-52">
                <img
                  src={imagePreviewUrl}
                  alt="Uploaded problem"
                  className="max-h-52 object-contain w-full"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs backdrop-blur-xs font-medium cursor-pointer"
                >
                  Change Image
                </button>
              </div>

              {/* Status / Loading */}
              {isAnalyzing && (
                <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-3 text-sm text-stone-700 dark:text-stone-300">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>Analyzing mathematical equation...</span>
                </div>
              )}

              {/* Extracted Equation Card */}
              {extractedProblem && !isAnalyzing && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Equation Extracted Successfully
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 capitalize">
                      {extractedProblem.subject} • {extractedProblem.topic}
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-stone-900 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-center text-lg font-medium text-stone-900 dark:text-stone-100 overflow-x-auto py-4">
                    <MathView math={extractedProblem.latex} block={true} />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedProblem && (
          <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              id="confirm-photo-problem-btn"
            >
              <span>Solve with MathGPT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
