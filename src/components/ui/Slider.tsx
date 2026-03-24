"use client";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

export function Slider({ min = 0, max = 10, step = 1, value, onChange, label }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-medium text-text-primary">{label}</label>
          <span className="text-[13px] font-semibold text-text-primary tabular-nums">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
        style={{
          background: `linear-gradient(to right, #10A37F 0%, #10A37F ${percentage}%, #E5E5E6 ${percentage}%, #E5E5E6 100%)`,
        }}
      />
    </div>
  );
}
