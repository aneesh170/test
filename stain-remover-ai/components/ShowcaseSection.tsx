import React from 'react';
import {
  TshirtIcon,
  SofaIcon,
  RugIcon,
  BedIcon,
  TrousersIcon,
  BabyIcon,
  CoffeeIcon,
  WineIcon,
  OilIcon,
  InkIcon,
  BloodDropIcon,
  LeafIcon,
  FoodIcon,
  MakeupIcon
} from './icons';

const items = [
  { name: 'T-Shirts & Tops', icon: <TshirtIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
  { name: 'Jeans & Trousers', icon: <TrousersIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
  { name: 'Upholstery', icon: <SofaIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
  { name: 'Rugs & Carpets', icon: <RugIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
  { name: 'Bedding & Linens', icon: <BedIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
  { name: "Kids' Clothes", icon: <BabyIcon className="w-8 h-8 mx-auto mb-2 text-indigo-500" /> },
];

const stains = [
    { name: 'Coffee & Tea', icon: <CoffeeIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Red Wine', icon: <WineIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Grease & Oil', icon: <OilIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Ink & Pen', icon: <InkIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Blood', icon: <BloodDropIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Grass & Dirt', icon: <LeafIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Food & Sauces', icon: <FoodIcon className="w-6 h-6 text-teal-600" /> },
    { name: 'Makeup', icon: <MakeupIcon className="w-6 h-6 text-teal-600" /> },
];


export const ShowcaseSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-100 border-t border-gray-200" aria-labelledby="showcase-heading">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="showcase-heading" className="text-3xl font-bold text-gray-800">
            Works on Any Fabric, Any Stain
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            From everyday clothes to household upholstery, our AI is trained to handle a wide range of items and the toughest, most common stains.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Items Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">Scan a Variety of Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  {item.icon}
                  <p className="text-sm font-medium text-gray-700">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stains Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-6">Identifies Popular Stains</h3>
            <ul className="space-y-3">
              {stains.map((stain, index) => (
                 <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-teal-50 transition-colors duration-200">
                    <div className="flex-shrink-0 bg-white p-2 rounded-full shadow-sm mr-4">
                      {stain.icon}
                    </div>
                    <span className="font-medium text-gray-700">{stain.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
