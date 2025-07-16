
import React, { useState } from 'react';
import { LaundryRecommendation, RecommendationStep, ProductRecommendationItem } from '../types';
import { CheckIcon, DropletIcon, QuestionMarkCircleIcon, SparklesIcon, TagIcon, ExclamationTriangleIcon, InformationCircleIcon, SunIcon, WashMachineIcon, EyeIcon, TshirtIcon, PaletteIcon, ShoppingCartIcon, ExternalLinkIcon, ThumbUpIcon, ThumbDownIcon } from './icons';

const stepIcons: Record<RecommendationStep['icon'], React.ReactNode> = {
  pretreat: <DropletIcon className="w-6 h-6 text-blue-500" />,
  wash: <WashMachineIcon className="w-6 h-6 text-indigo-500" />,
  dry: <SunIcon className="w-6 h-6 text-yellow-500" />,
  check: <CheckIcon className="w-6 h-6 text-green-500" />,
};

const getConfidenceColor = (confidence: 'High' | 'Medium' | 'Low') => {
    switch(confidence) {
        case 'High': return 'text-green-600';
        case 'Medium': return 'text-yellow-600';
        case 'Low': return 'text-red-600';
        default: return 'text-gray-500';
    }
}

const ProductItem: React.FC<{ product: ProductRecommendationItem }> = ({ product }) => (
    <li className="flex items-start gap-4 p-3 bg-white rounded-lg border">
        <img src={product.imageLink} alt={product.productName} className="w-16 h-16 object-contain rounded-md flex-shrink-0" />
        <div className="flex-grow">
            <a href={product.purchaseLink} target="_blank" rel="noopener noreferrer" className="font-bold text-gray-800 hover:text-indigo-600 hover:underline inline-flex items-center gap-1.5">
                {product.productName}
                <ExternalLinkIcon className="w-4 h-4 text-gray-500" />
            </a>
            <p className="text-gray-600 mt-1">{product.reason}</p>
        </div>
    </li>
);

const Instruction: React.FC<{ step: RecommendationStep, allProducts: ProductRecommendationItem[] }> = ({ step, allProducts }) => {
    if (!step.recommendedProductName || !step.instruction.includes(step.recommendedProductName)) {
        return <p className="text-gray-600">{step.instruction}</p>;
    }

    const product = allProducts.find(p => p.productName === step.recommendedProductName);
    if (!product) {
        return <p className="text-gray-600">{step.instruction}</p>;
    }

    const parts = step.instruction.split(step.recommendedProductName);

    return (
        <p className="text-gray-600">
            {parts[0]}
            <a
                href={product.purchaseLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
            >
                {step.recommendedProductName}
                <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
            {parts[1]}
        </p>
    );
};

export const ResultCard: React.FC<{ recommendation: LaundryRecommendation }> = ({ recommendation }) => {
  const { garmentAnalysis, stainAnalysis, recommendations, productRecommendations } = recommendation;
  const allProducts = [...(productRecommendations.stainRemovers || []), ...(productRecommendations.washingSupplies || [])];
  const [feedbackState, setFeedbackState] = useState<'idle' | 'prompting' | 'submitted'>('idle');
  const [feedbackReason, setFeedbackReason] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">{recommendations.title}</h2>
        <p className="text-gray-600 mt-1">{recommendations.summary}</p>
      </div>

      {/* Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Garment Analysis */}
        <div className="bg-gray-50 p-4 rounded-xl border">
          <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-4"><TagIcon className="w-6 h-6 text-emerald-500" /> Garment Details</h3>
          <div className="space-y-3 text-sm">
            <p className="flex items-start gap-2.5">
                <InformationCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">Material: {garmentAnalysis.detectedMaterial}</span>
            </p>
             <p className="flex items-start gap-2.5">
                <TshirtIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">Item Type: {garmentAnalysis.itemType}</span>
            </p>
            <p className="flex items-start gap-2.5">
                <PaletteIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">Color: {garmentAnalysis.color}</span>
            </p>
            <div className="pt-2">
                <p className="block mb-1 text-gray-700">Care Symbols:</p>
                <div className="flex flex-wrap gap-2">
                {garmentAnalysis.careSymbols.length > 0 ? garmentAnalysis.careSymbols.map((s, i) => (
                    <div key={i} className="bg-white border rounded-md px-2 py-1 text-xs text-gray-700" title={s.meaning}>
                    {s.symbol}
                    </div>
                )) : <span className="text-gray-600 text-xs">No symbols detected.</span>}
                </div>
            </div>
          </div>
        </div>

        {/* Stain Analysis */}
        <div className="bg-gray-50 p-4 rounded-xl border">
          <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2 mb-4"><SparklesIcon className="w-6 h-6 text-indigo-500" /> Stain Analysis</h3>
          <div className="space-y-3 text-sm">
             <p className="flex items-start gap-2.5">
                <InformationCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">Detected Stain: {stainAnalysis.detectedStain}</span>
            </p>
             {stainAnalysis.stainDescription && (
              <p className="flex items-start gap-2.5">
                  <EyeIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700">Description: {stainAnalysis.stainDescription}</span>
              </p>
             )}
            <p className="flex items-start gap-2.5">
                <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">
                    Confidence:{' '}
                    <span className={`font-semibold ${getConfidenceColor(stainAnalysis.confidence)}`}>{stainAnalysis.confidence}</span>
                </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div>
        <h3 className="font-semibold text-xl text-gray-700 mb-4">Step-by-Step Instructions</h3>
        <ol className="space-y-4">
          {recommendations.steps.map((step) => (
            <li key={step.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                    {stepIcons[step.icon] || <CheckIcon className="w-6 h-6 text-gray-500"/>}
                </div>
                {step.step < recommendations.steps.length && <div className="w-px h-full bg-gray-200" />}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">Step {step.step}</h4>
                <Instruction step={step} allProducts={allProducts} />
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Warnings */}
      {recommendations.warnings && recommendations.warnings.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Warnings</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc space-y-1 pl-5">
                  {recommendations.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Recommendations */}
      {productRecommendations && (productRecommendations.stainRemovers.length > 0 || productRecommendations.washingSupplies.length > 0) && (
        <div>
          <h3 className="font-semibold text-xl text-gray-700 mb-4 flex items-center gap-3">
            <ShoppingCartIcon className="w-6 h-6 text-green-500" />
            Recommended Products
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl border space-y-4 text-sm">
            {productRecommendations.stainRemovers.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 text-base">Stain Removers</h4>
                <ul className="space-y-3">
                  {productRecommendations.stainRemovers.map((product, i) => (
                    <ProductItem key={`stain-remover-${i}`} product={product} />
                  ))}
                </ul>
              </div>
            )}
            {productRecommendations.washingSupplies.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3 text-base">Washing Supplies</h4>
                 <ul className="space-y-3">
                  {productRecommendations.washingSupplies.map((product, i) => (
                    <ProductItem key={`washing-supply-${i}`} product={product} />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        {feedbackState === 'idle' && (
          <div className="flex flex-col items-center gap-4">
            <p className="font-semibold text-gray-700">Was this advice helpful?</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFeedbackState('submitted')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
                aria-label="Yes, this was helpful"
              >
                <ThumbUpIcon className="w-5 h-5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => setFeedbackState('prompting')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                aria-label="No, this was not helpful"
              >
                <ThumbDownIcon className="w-5 h-5" />
                <span>No</span>
              </button>
            </div>
          </div>
        )}

        {feedbackState === 'prompting' && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <p className="font-semibold text-gray-700 text-center">Sorry to hear that. How can we improve this recommendation?</p>
            <textarea
              value={feedbackReason}
              onChange={(e) => setFeedbackReason(e.target.value)}
              placeholder="e.g., The instructions were unclear, the product recommended was not suitable..."
              className="w-full h-24 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-800 placeholder:text-gray-500"
              aria-label="Feedback reason"
            />
            <button
              onClick={() => setFeedbackState('submitted')}
              className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-colors"
            >
              Submit Feedback
            </button>
          </div>
        )}
        
        {feedbackState === 'submitted' && (
          <div className="text-center p-4 bg-blue-50 text-blue-800 rounded-lg animate-fade-in">
            <p>Thank you for your feedback! We will use this to improve our model.</p>
          </div>
        )}
      </div>
    </div>
  );
};
