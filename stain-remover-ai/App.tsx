

import React, { useState, useCallback, useRef } from 'react';
import heic2any from 'heic2any';
import { CameraIcon, CheckCircleIcon, LoaderIcon, ExclamationTriangleIcon, SparklesIcon, TagIcon, EditIcon, XMarkIcon, UploadIcon, ChevronDownIcon } from './components/icons';
import { Camera } from './components/Camera';
import { getLaundryAdvice } from './services/geminiService';
import { LaundryRecommendation } from './types';
import { ResultCard } from './components/ResultCard';
import { ShowcaseSection } from './components/ShowcaseSection';

type View = 'home' | 'scanStain' | 'scanTag';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [stainImage, setStainImage] = useState<string | null>(null);
  const [tagImage, setTagImage] = useState<string | null>(null);
  const [additionalText, setAdditionalText] = useState('');
  const [recommendation, setRecommendation] = useState<LaundryRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleStainCapture = (image: string) => {
    setStainImage(image);
    setView('home');
  };

  const handleTagCapture = (image: string) => {
    setTagImage(image);
    setView('home');
  };

  const handleGetAdvice = useCallback(async () => {
    if (!stainImage) {
      setError("Please scan the stain on your garment to get started.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const result = await getLaundryAdvice(stainImage, tagImage, additionalText);
      setRecommendation(result);
    } catch (e) {
      console.error(e);
      setError("Sorry, I couldn't generate advice. The AI might be busy, or the image might be unclear. Please try again with a clearer picture.");
    } finally {
      setIsLoading(false);
    }
  }, [stainImage, tagImage, additionalText]);
  
  const handleReset = () => {
    setStainImage(null);
    setTagImage(null);
    setAdditionalText('');
    setRecommendation(null);
    setError(null);
    setIsLoading(false);
    setView('home');
    setOpenFaqIndex(null);
  };

  const renderHome = () => (
    <>
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <hgroup className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Stain Remover AI</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Say goodbye to stubborn stains! Our AI-powered laundry guide analyzes stains from your photos to provide instant, step-by-step removal instructions. Just scan the stain, optionally add the garment tag, and get personalized advice in seconds.
          </p>
        </hgroup>

        <section aria-labelledby="steps-heading">
          <h2 id="steps-heading" className="sr-only">How to get stain removal advice</h2>
          <div className="space-y-6">
            {/* Step 1: Scan Stain */}
            <ScanStep
              step="1"
              title="Scan Stain"
              icon={<SparklesIcon className="w-6 h-6 text-indigo-500" />}
              image={stainImage}
              onCameraClick={() => setView('scanStain')}
              onImageSelected={handleStainCapture}
              onClearClick={() => setStainImage(null)}
              color="indigo"
              isLoading={isLoading}
            />

            {/* Step 2: Scan Garment Tag */}
            <ScanStep
              step="2"
              title="Scan Garment Tag"
              icon={<TagIcon className="w-6 h-6 text-teal-500" />}
              image={tagImage}
              onCameraClick={() => setView('scanTag')}
              onImageSelected={handleTagCapture}
              onClearClick={() => setTagImage(null)}
              color="teal"
              optional
            />
            
            {/* Step 3: Add Details */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gray-100 text-gray-600 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-semibold text-gray-800">Add Details</h2>
                <span className="text-sm text-gray-500">(Optional)</span>
                <EditIcon className="w-6 h-6 text-gray-400 ml-auto" />
              </div>
              <textarea
                value={additionalText}
                onChange={(e) => setAdditionalText(e.target.value)}
                placeholder="e.g., This is an old red wine stain. The fabric is delicate silk."
                className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 placeholder:text-gray-500"
                aria-label="Additional details"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <div className="flex">
              <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-4" /></div>
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pt-8">
          <button
            onClick={handleGetAdvice}
            disabled={!stainImage || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-gray-100 font-bold py-4 px-10 rounded-full transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center mx-auto w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <LoaderIcon className="animate-spin h-6 w-6 mr-3" />
                Analyzing...
              </>
            ) : (
              'Get Care Advice'
            )}
          </button>
        </div>
        
        {recommendation && (
           <article className="mt-8 animate-fade-in" aria-labelledby="recommendation-title">
             <h2 id="recommendation-title" className="sr-only">Your Personalized Stain Removal Recommendation</h2>
              <ResultCard recommendation={recommendation} />
               <div className="text-center mt-8">
                  <button
                      onClick={handleReset}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-full transition-all duration-300"
                  >
                      Start Over
                  </button>
              </div>
           </article>
        )}
      </div>

      {!recommendation && (
        <>
          <section className="py-16 bg-white border-t border-gray-200" aria-labelledby="faq-heading">
            <div className="max-w-3xl mx-auto px-4">
              <h2 id="faq-heading" className="text-3xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
              <div>
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    faq={faq}
                    index={index}
                    isOpen={openFaqIndex === index}
                    onToggle={handleFaqToggle}
                  />
                ))}
              </div>
            </div>
          </section>
          <ShowcaseSection />
        </>
      )}
    </>
  );

  switch (view) {
    case 'scanStain':
      return <Camera onCapture={handleStainCapture} onCancel={() => setView('home')} />;
    case 'scanTag':
      return <Camera onCapture={handleTagCapture} onCancel={() => setView('home')} />;
    case 'home':
    default:
      return (
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col">
          <main className="flex-grow">{renderHome()}</main>
           <footer className="py-6 text-center text-xs text-gray-500">
            <p>Data is only used to train the model and is not shared directly with any third parties.</p>
            <p className="mt-1">&copy; 2025 All Rights Reserved - Maculeye</p>
          </footer>
        </div>
      );
  }
};

interface ScanStepProps {
  step: string;
  title: string;
  icon: React.ReactNode;
  image: string | null;
  onCameraClick: () => void;
  onImageSelected: (base64: string) => void;
  onClearClick: () => void;
  color: 'indigo' | 'teal';
  optional?: boolean;
  isLoading?: boolean;
}

const ScanStep: React.FC<ScanStepProps> = ({
  step,
  title,
  icon,
  image,
  onCameraClick,
  onImageSelected,
  onClearClick,
  color,
  optional,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const colors = {
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      ring: 'ring-indigo-500',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      stepBg: 'bg-indigo-100',
      stepText: 'text-indigo-600',
      border: 'border-indigo-500',
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      ring: 'ring-teal-500',
      button: 'bg-teal-600 hover:bg-teal-700',
      stepBg: 'bg-teal-100',
      stepText: 'text-teal-600',
      border: 'border-teal-500',
    },
  };

  const theme = colors[color];

  const handleFileSelect = async (file: File | null) => {
    if (!file || isUploading) return;
    setIsUploading(true);

    try {
      const fileName = file.name.toLowerCase();
      const isHeic =
        file.type.includes('heic') ||
        file.type.includes('heif') ||
        fileName.endsWith('.heic') ||
        fileName.endsWith('.heif');

      let finalBlob: Blob = file;

      if (isHeic) {
        const conversionResult = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9,
        });

        finalBlob = Array.isArray(conversionResult)
          ? conversionResult[0]
          : conversionResult;

        if (!(finalBlob instanceof Blob)) {
          throw new Error('HEIC conversion failed. Try using a JPEG or PNG.');
        }
      }

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject('Failed to read file');
        reader.readAsDataURL(finalBlob);
      });

      onImageSelected(base64);
    } catch (error) {
      console.error('Image processing error:', error);
      alert(
        'Failed to process image. Please upload a JPEG, PNG, or HEIC file under 10MB.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragEvents = (
    e: React.DragEvent<HTMLDivElement>,
    entering: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !isUploading) {
      setIsDragging(entering);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isLoading && !isUploading && e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-all">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="hidden"
        onChange={onFileInputChange}
        disabled={isLoading || isUploading}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`${theme.stepBg} ${theme.stepText} rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-bold text-sm`}
          >
            {step}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {optional && <span className="text-sm text-gray-500">(Optional)</span>}
          {icon}
        </div>
        <div className="flex-grow flex items-center justify-end gap-4 ml-auto">
          {image && (
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircleIcon className="w-6 h-6" />
              <span>Captured</span>
            </div>
          )}
        </div>
      </div>

      {image ? (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 border">
            <img
              src={image}
              alt={`${title} preview`}
              className="w-full h-full object-cover"
            />
            {!isLoading && (
              <button
                onClick={onClearClick}
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75 transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="text-center sm:text-left">
            <p className={`${theme.text} font-semibold`}>
              {isLoading ? 'Analyzing image...' : 'Image ready for analysis.'}
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={(e) => handleDragEvents(e, true)}
          onDragLeave={(e) => handleDragEvents(e, false)}
          onDragOver={(e) => handleDragEvents(e, true)}
          onDrop={handleDrop}
          className={`mt-4 p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
            isDragging && !isUploading
              ? `${theme.bg} border-solid ${theme.border}`
              : 'border-gray-300'
          } ${isUploading ? 'cursor-wait bg-gray-50' : ''}`}
        >
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
            <button
              onClick={handleUploadClick}
              disabled={isLoading || isUploading}
              className={`flex items-center justify-center px-5 py-2 rounded-full font-semibold text-sm text-white transition-colors ${theme.button} disabled:bg-slate-400 disabled:cursor-not-allowed min-w-[160px]`}
            >
              {isUploading ? (
                <>
                  <LoaderIcon className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Upload Photo
                </>
              )}
            </button>
            <span className="text-gray-500 text-sm font-medium">or</span>
            <button
              onClick={onCameraClick}
              disabled={isLoading || isUploading}
              className="flex items-center justify-center px-5 py-2 rounded-full font-semibold text-sm bg-white border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <CameraIcon className="w-5 h-5 mr-2" />
              Use Camera
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            You can also drag and drop an image file here.
          </p>
        </div>
      )}
    </div>
  );
};



const faqs = [
  {
    question: "How does the AI identify stains and fabrics?",
    answer: "Our advanced AI is trained on a massive dataset of images. It analyzes the colors, shapes, and textures in your photo to identify the most likely type of stain. When you provide a picture of the garment tag, it uses Optical Character Recognition (OCR) to read the care symbols and text, ensuring the advice is perfectly tailored to your item's needs."
  },
  {
    question: "Is this safe to use for all my clothes?",
    answer: "Yes! Our primary goal is to provide safe and effective advice. By analyzing the garment tag, we ensure our recommendations adhere to the manufacturer's care instructions. If no tag is provided, the AI makes a conservative estimate of the fabric type and provides instructions that are generally safe for most common materials."
  },
  {
    question: "What if I don't know what the stain is?",
    answer: "That's exactly what Stain Remover AI is for! You don't need to know anything about the stain. Just take a clear, well-lit photo, and our AI will do the hard work of identifying it and telling you how to get it out."
  },
  {
    question: "Do I have to use the specific products you recommend?",
    answer: "The products we recommend are chosen based on their proven effectiveness for the identified stain and fabric type. While you'll likely get the best results with them, our step-by-step instructions can often be adapted for similar products you may already have at home."
  },
  {
    question: "How is my privacy protected?",
    answer: "We take your privacy seriously. The images you upload are used solely for the purpose of analyzing your stain and are not shared with any third parties. They are processed anonymously and may be used to improve the accuracy of our AI model in the future."
  }
];

const FAQItem: React.FC<{ faq: { question: string, answer: string }, index: number, isOpen: boolean, onToggle: (index: number) => void }> = ({ faq, index, isOpen, onToggle }) => (
    <div className="border-b border-gray-200 last:border-b-0">
        <h3 className="text-lg font-medium">
            <button
                onClick={() => onToggle(index)}
                className="w-full flex justify-between items-center text-left py-5 text-gray-800 hover:text-indigo-600 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
            >
                <span className="flex-1 pr-4">{faq.question}</span>
                <ChevronDownIcon className={`flex-shrink-0 w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-gray-500'}`} />
            </button>
        </h3>
        <div
            id={`faq-answer-${index}`}
            className={`grid overflow-hidden transition-all duration-300 ease-in-out text-gray-600 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
            <div className="overflow-hidden">
                <p className="pt-1 pb-5 pr-6">
                    {faq.answer}
                </p>
            </div>
        </div>
    </div>
);

export default App;
