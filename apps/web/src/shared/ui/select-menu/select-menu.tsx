"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectMenuOption = {
  value: string;
  label: string;
};

type SelectMenuProps = {
  value: string;
  options: SelectMenuOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
};

function getNextIndex(index: number, direction: 1 | -1, length: number) {
  if (length === 0) {
    return -1;
  }

  return (index + direction + length) % length;
}

export function SelectMenu({
  value,
  options,
  onChange,
  ariaLabel,
  className = "",
}: SelectMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [highlightedIndex, setHighlightedIndex] = useState(
    Math.max(selectedIndex, 0),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() =>
      listboxRef.current?.focus(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  function openMenu(index = Math.max(selectedIndex, 0)) {
    if (options.length === 0) {
      return;
    }

    setHighlightedIndex(index);
    setIsOpen(true);
  }

  function closeMenu(shouldRestoreFocus = false) {
    setIsOpen(false);
    if (shouldRestoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function chooseOption(index: number) {
    const option = options[index];
    if (!option) {
      return;
    }

    onChange(option.value);
    closeMenu(true);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(getNextIndex(Math.max(selectedIndex, -1), 1, options.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(
        getNextIndex(selectedIndex < 0 ? 0 : selectedIndex, -1, options.length),
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }
  }

  function handleListboxKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => getNextIndex(index, 1, options.length));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((index) => getNextIndex(index, -1, options.length));
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setHighlightedIndex(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setHighlightedIndex(Math.max(options.length - 1, 0));
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseOption(highlightedIndex);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(true);
      return;
    }

    if (event.key === "Tab") {
      closeMenu();
    }
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-left text-[15px] font-semibold text-ink shadow-[0_1px_0_rgba(9,64,111,0.03)] outline-none transition focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/10"
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? "Выберите значение"}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 text-brand transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          strokeWidth={2.2}
        />
      </button>

      {isOpen && (
        <div
          aria-label={ariaLabel}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_42px_rgba(9,64,111,0.16)] outline-none"
          id={listboxId}
          onKeyDown={handleListboxKeyDown}
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isHighlighted = index === highlightedIndex;

            return (
              <button
                aria-selected={isSelected}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold outline-none transition focus-visible:bg-[#edf5ff] ${
                  isHighlighted ? "bg-[#edf5ff] text-brand" : "text-ink"
                }`}
                key={option.value}
                onClick={() => chooseOption(index)}
                onMouseEnter={() => setHighlightedIndex(index)}
                role="option"
                type="button"
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <Check
                    aria-hidden="true"
                    className="size-4 shrink-0 text-brand"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
