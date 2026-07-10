import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export interface PickerOption {
  value: string;
  label: string;
}

interface PickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  options: PickerOption[];
  selectedValue: string;
}

export function PickerModal({ isOpen, onClose, onConfirm, options, selectedValue }: PickerModalProps) {
  const [internalValue, setInternalValue] = useState(selectedValue);

  useEffect(() => {
    if (isOpen) {
      setInternalValue(selectedValue);
    }
  }, [isOpen, selectedValue]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex flex-col justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-t-3xl w-full animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none border-t border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 font-medium px-2 py-1"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm(internalValue);
              onClose();
            }}
            className="text-[#1860F5] dark:text-[#60A5FA] font-medium px-2 py-1"
          >
            Confirm
          </button>
        </div>
        
        {/* Scrollable Body List */}
        <div className="flex flex-col max-h-[40vh] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInternalValue(opt.value)}
              className={`flex items-center justify-between px-6 py-4 transition ${
                internalValue === opt.value
                  ? "bg-gray-50 dark:bg-gray-800/50"
                  : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <span className={`text-[15px] ${internalValue === opt.value ? "text-[#424242] dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400 font-medium"}`}>
                {opt.label}
              </span>
              {internalValue === opt.value && <Check size={18} className="text-[#1860F5] dark:text-[#60A5FA]" />}
            </button>
          ))}
        </div>
        
        {/* Padding for iOS home indicator */}
        <div className="h-6" />
      </div>
    </div>
  );
}
