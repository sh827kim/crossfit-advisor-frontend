'use client';

import { useRef, useState, useEffect } from 'react';

const DEFAULT_TIME_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40] as const;
const ITEM_WIDTH = 60; // Distance between items

interface CareTimeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: readonly number[];
  label?: string;
  className?: string;
}

export function CareTimeSelector({
  value,
  onChange,
  options = DEFAULT_TIME_OPTIONS,
  label = '운동 시간',
  className = '',
}: CareTimeSelectorProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  const currentIndex = options.indexOf(value);

  // Reset drag offset when value changes externally (or after snap)
  useEffect(() => {
    setDragOffset(0);
  }, [value]);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    dragStartX.current = clientX;
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX.current === null) return;
    const diff = clientX - dragStartX.current;

    // Limit drag (resistance at edges if needed, or just let it flow)
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (dragStartX.current === null) return;
    setIsDragging(false);
    dragStartX.current = null;

    // Calculate how many items to move based on drag distance
    // Dragging LEFT (negative offset) means moving to NEXT item (positive index increment)
    const steps = -Math.round(dragOffset / ITEM_WIDTH);
    const targetIndex = currentIndex + steps;

    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(options.length - 1, targetIndex));

    if (clampedIndex !== currentIndex) {
      onChange(options[clampedIndex]);
    } else {
      setDragOffset(0); // Snap back if moved less than half an item
    }
  };

  // Helper to render items at relative positions
  const renderItem = (offsetIndex: number) => {
    const targetIndex = currentIndex + offsetIndex;
    if (targetIndex < 0 || targetIndex >= options.length) return null;

    const itemValue = options[targetIndex];
    // Visual position: offsetIndex * 60 + dragOffset
    const visualX = offsetIndex * ITEM_WIDTH + dragOffset;

    // Calculate styles based on distance from center (0)
    const distance = Math.abs(visualX);
    const threshold = ITEM_WIDTH / 2;

    let scale = 1;
    let opacity = 1;
    let zIndex = 10;

    const isCenter = distance < threshold;

    if (isCenter) {
      // Center: 1.0 scale, 1.0 opacity
      scale = 1 - (distance / (ITEM_WIDTH * 2)); // Subtle shrink as it moves away
      zIndex = 20;
    } else {
      // Neighbors: shrink
      scale = 0.7;
      if (distance > ITEM_WIDTH * 1.5) {
        opacity = 0.25;
        zIndex = 0;
      } else {
        zIndex = 10;
      }
    }

    // Styles for "Center" vs "Neighbors"
    // Use opacity for visual hierarchy instead of gradient text for better reliability
    const textStyleClass = isCenter
      ? "text-[40px] font-black text-white"
      : "text-[27px] font-bold text-white";

    // Dynamic Style for Position & Transform
    const style: React.CSSProperties = {
      transform: `translateX(${visualX}px) scale(${scale})`,
      opacity: isCenter ? 1 : (distance > ITEM_WIDTH * 1.5 ? 0.2 : 0.4), // Distinct opacity levels
      position: 'absolute',
      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s',
      left: '50%',
      marginLeft: '-30px',
      width: '60px',
      textAlign: 'center',
      zIndex: zIndex,
    };

    return (
      <div
        key={itemValue}
        style={style}
        className={`flex items-center justify-center select-none font-sf-pro leading-none cursor-pointer ${textStyleClass}`}
        onClick={() => onChange(itemValue)}
      >
        {itemValue}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-2 ${className} cursor-grab active:cursor-grabbing`}
      onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
      onTouchEnd={handleDragEnd}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onMouseMove={(e) => isDragging && handleDragMove(e.clientX)}
      onMouseUp={handleDragEnd}
      onMouseLeave={() => isDragging && handleDragEnd()}
    >
      {/* Label */}
      <h3 className="text-[13px] font-extrabold text-white mb-4 font-apple">{label}</h3>

      {/* Slider Area */}
      <div className="relative w-full h-[50px] flex items-center justify-center">
        {options.map((_, index) => renderItem(index - currentIndex))}
      </div>

      {/* Unit */}
      <span className="text-[11px] font-extrabold text-white mt-1">분</span>
    </div>
  );
}
