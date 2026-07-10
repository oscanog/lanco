import React from "react";
import { Check } from "lucide-react";

export interface BottomSheetOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  options: BottomSheetOption[];
  selectedValue: string;
}

export function BottomSheetModal({ isOpen, onClose, onSelect, options, selectedValue }: BottomSheetModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex flex-col justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full pt-4 pb-8 px-5 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none border-t border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
        
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value);
                onClose();
              }}
              className={`flex items-center justify-between px-4 py-4 rounded-xl transition ${
                selectedValue === opt.value
                  ? "bg-[#229799]/10 border border-[#229799]"
                  : "bg-white dark:bg-gray-800 border border-transparent hover:bg-gray-50 dark:hover:bg-gray-900"
              }`}
            >
              <div className="flex items-center gap-3">
                {opt.icon && <span className="text-xl">{opt.icon}</span>}
                <span className={`font-semibold ${selectedValue === opt.value ? "text-[#229799]" : "text-gray-800 dark:text-gray-200"}`}>
                  {opt.label}
                </span>
              </div>
              {selectedValue === opt.value && <Check size={20} className="text-[#229799]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
