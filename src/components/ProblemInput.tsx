import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Camera, Upload, Keyboard, RefreshCw, Check, Edit3, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { MathView } from './MathView.js';
import { MathSymbolBar } from './MathSymbolBar.js';
import type { MathProblem } from '../types.js';

interface ProblemInputProps {
  initialMode?: 'upload' | 'type';
  onProblemConfirmed: (problem: MathProblem) => void;
  onCancel: () => void;
}

export function ProblemInput({
  initialMode = 'upload',
  onProblemConfirmed,
  onCancel,
}: ProblemInputProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'type'>(initialMode);
  const [typedInput, setTypedInput] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation state
  const [analyzedProblem, setAnalyzedProblem] = useState<MathProblem | null>(null);
  const [isEditingConfirmation, setIsEditingConfirmation] = useState(false);
  const [editedLatex, setEditedLatex] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPEG, WebP, etc.).');
      return;
    }

    setErrorMsg(null);
    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreviewUrl(result);
      // Strip data URL prefix for API base64 payload
      const base64Data = result.split(',')[1];
      setSelectedImageBase64(base64Data);
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
      processImageFile(file);
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    if (isEditingConfirmation) {
      setEditedLatex((prev) => prev + symbol);
      return;
    }

    if (textAreaRef.current) {
      const textarea = textAreaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const nextVal = typedInput.substring(0, start) + symbol + typedInput.substring(end);
      setTypedInput(nextVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + symbol.length, start + symbol.length);
      }, 10);
    } else {
      setTypedInput((prev) => prev + symbol);
    }
  };

  const handleAnalyze = async () => {
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      if (activeTab === 'upload') {
        if (!selectedImageBase64) {
          setErrorMsg('Please select or capture a photo of your math problem first.');
          setIsAnalyzing(false);
          return;
        }

        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: selectedImageBase64,
            mimeType: imageMimeType,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to analyze the uploaded image.');
        }

        const data = await res.json();

        if (!data.isReadable) {
          setErrorMsg(
            data.unreadableReason ||
              "I couldn't read part of the problem clearly. Please upload a clearer image or type the problem."
          );
          setIsAnalyzing(false);
          return;
        }

        const problem: MathProblem = {
          id: 'prob_' + Date.now(),
          rawInput: data.plainText || data.latex,
          latex: data.latex,
          subject: (data.subject as 'algebra' | 'calculus') || 'algebra',
          topic: data.topic || 'General Problem',
          difficulty: data.difficulty || 'intermediate',
          suggestedStepsCount: data.suggestedStepsCount || 4,
        };

        setAnalyzedProblem(problem);
        setEditedLatex(problem.latex);
      } else {
        if (!typedInput.trim()) {
          setErrorMsg('Please enter a mathematical expression or equation.');
          setIsAnalyzing(false);
          return;
        }

        const res = await fetch('/api/parse-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: typedInput.trim() }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to parse problem notation.');
        }

        const data = await res.json();

        const problem: MathProblem = {
          id: 'prob_' + Date.now(),
          rawInput: typedInput.trim(),
          latex: data.latex || typedInput.trim(),
          subject: (data.subject as 'algebra' | 'calculus') || 'algebra',
          topic: data.topic || 'General Problem',
          difficulty: data.difficulty || 'intermediate',
          suggestedStepsCount: data.suggestedStepsCount || 4,
        };

        setAnalyzedProblem(problem);
        setEditedLatex(problem.latex);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while analyzing the problem. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndStart = () => {
    if (!analyzedProblem) return;

    if (isEditingConfirmation) {
      const finalProblem: MathProblem = {
        ...analyzedProblem,
        latex: editedLatex.trim(),
        rawInput: editedLatex.trim(),
      };
      onProblemConfirmed(finalProblem);
    } else {
      onProblemConfirmed(analyzedProblem);
    }
  };

  // If problem is analyzed, show confirmation screen
  if (analyzedProblem) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-stone-100 text-stone-600 uppercase">
              {analyzedProblem.subject} • {analyzedProblem.topic}
            </span>
            <h2 className="text-2xl font-bold text-stone-900 pt-2">I understood your problem as:</h2>
            <p className="text-sm text-stone-500">
              Please verify the mathematical notation below before we start our step-by-step session.
            </p>
          </div>

          {/* Rendered Math Box */}
          <div className="p-6 rounded-xl bg-stone-50 border border-stone-200 text-center flex flex-col items-center justify-center min-h-[100px] overflow-x-auto">
            {isEditingConfirmation ? (
              <div className="w-full space-y-3">
                <label className="text-xs text-stone-500 font-medium block text-left">
                  Edit LaTeX / Math Notation:
                </label>
                <textarea
                  value={editedLatex}
                  onChange={(e) => setEditedLatex(e.target.value)}
                  className="w-full p-3 font-mono text-sm border border-stone-300 rounded-lg bg-white focus:border-stone-500 focus:outline-none"
                  rows={3}
                />
                <MathSymbolBar onInsert={handleInsertSymbol} />
                <div className="mt-2 text-left">
                  <span className="text-xs text-stone-400 block mb-1">Live Preview:</span>
                  <div className="p-3 bg-white border border-stone-200 rounded-lg text-stone-900 text-lg">
                    <MathView math={editedLatex} block={true} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xl sm:text-2xl text-stone-900 py-2">
                <MathView math={analyzedProblem.latex} block={true} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="text-center font-medium text-stone-700 text-sm">
              Is this correct?
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleConfirmAndStart}
                className="w-full sm:w-auto px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
                id="confirm-yes-start-btn"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Yes, Start</span>
              </button>

              {!isEditingConfirmation ? (
                <button
                  onClick={() => setIsEditingConfirmation(true)}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                  id="confirm-edit-btn"
                >
                  <Edit3 className="w-4 h-4 text-stone-500" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingConfirmation(false);
                    setEditedLatex(analyzedProblem.latex);
                  }}
                  className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>Reset Edit</span>
                </button>
              )}

              <button
                onClick={() => {
                  setAnalyzedProblem(null);
                  setIsEditingConfirmation(false);
                }}
                className="w-full sm:w-auto px-4 py-3 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors cursor-pointer"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header with back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
          id="back-to-home-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs text-stone-600 font-medium">Algebra & Calculus Tutor</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Enter Your Problem</h2>
          <p className="text-sm text-stone-500 mt-1">
            Upload a handwritten or printed math problem photo, or type the expression.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-stone-100 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('upload');
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            id="tab-upload-btn"
          >
            <Camera className="w-4 h-4 text-stone-600" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('type');
              setErrorMsg(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'type'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
            id="tab-type-btn"
          >
            <Keyboard className="w-4 h-4 text-stone-600" />
            <span>Type Expression</span>
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
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

            {!imagePreviewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                }`}
                id="dropzone-box"
              >
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3 text-stone-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-stone-800">
                  Click to upload or drag & drop photo
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Handwritten or textbook photo (PNG, JPG, HEIC, WebP)
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-xs font-medium text-stone-700 flex items-center gap-1.5 shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-500" />
                    <span>Take Photo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-stone-200 max-h-72 bg-stone-950 flex items-center justify-center">
                  <img
                    src={imagePreviewUrl}
                    alt="Problem to solve"
                    className="max-h-72 object-contain"
                  />
                  <button
                    onClick={() => {
                      setImagePreviewUrl(null);
                      setSelectedImageBase64(null);
                    }}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-stone-900/80 hover:bg-stone-900 text-white text-xs rounded-md backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Type Mode */}
        {activeTab === 'type' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="math-problem-input" className="text-xs font-medium text-stone-600">
                Mathematical Expression:
              </label>
              <textarea
                id="math-problem-input"
                ref={textAreaRef}
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="e.g. 2x^2 + 5x - 3 = 0  or  \int x^2 sin(x) dx"
                className="w-full p-4 text-base font-mono bg-stone-50 border border-stone-300 rounded-xl focus:border-stone-900 focus:bg-white focus:outline-none transition-colors"
                rows={3}
              />
            </div>

            {/* Quick Math Symbols palette */}
            <MathSymbolBar onInsert={handleInsertSymbol} />

            {/* Live Typing Preview */}
            {typedInput.trim() && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-mono text-stone-600 uppercase tracking-wider block mb-1">
                  Preview:
                </span>
                <div className="text-stone-900 text-base">
                  <MathView math={typedInput} block={false} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
            id="analyze-problem-btn"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Analyzing Problem...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Analyze Problem</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
