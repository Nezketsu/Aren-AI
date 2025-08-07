import React from "react";

export function Sprout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0 .1 0" />
      <path d="M16 9c1 .8 2.3 2.3 3.3 3.6a4.2 4.2 0 0 0-6.6-5.1 9.8 9.8 0 0 0-1.6-1.9c.7 0 1.4-.1 2.3-.1h.3c1.7 0 2.5.3 2.3 3.5z" />
    </svg>
  );
}
