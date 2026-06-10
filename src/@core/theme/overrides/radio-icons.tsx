import React from "react";

const IconChecked = () => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path
        d='M5.5 12a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0Z'
        fill='var(--mui-palette-common-white)'
        stroke='currentColor'
        strokeWidth='5'
      />
    </svg>
  );
};

const UncheckedIcon = () => {
  return (
    <svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <path d='M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0Z' stroke='var(--mui-palette-text-disabled)' strokeWidth='2' />
    </svg>
  );
};

export { IconChecked, UncheckedIcon };
