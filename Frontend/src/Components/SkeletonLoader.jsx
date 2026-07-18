import React from "react";

/**
 * Reusable skeleton loader blocks using Tailwind's animate-pulse.
 */

export const SkeletonText = ({ className = "h-4 w-3/4 mb-2" }) => (
  <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
);

export const SkeletonAvatar = ({ className = "w-10 h-10 rounded-full" }) => (
  <div className={`bg-gray-200 animate-pulse ${className}`}></div>
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 p-0 flex flex-col h-full">
    {/* Image placeholder */}
    <div className="bg-gray-200 animate-pulse aspect-square w-full"></div>
    {/* Content placeholder */}
    <div className="p-5 flex flex-col flex-1">
      <SkeletonText className="h-6 w-full mb-3" />
      <SkeletonText className="h-4 w-1/2 mb-4" />
      <SkeletonText className="h-4 w-full mb-2" />
      <SkeletonText className="h-4 w-3/4 mb-6" />
      <div className="mt-auto">
        <SkeletonText className="h-8 w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-2">
          <SkeletonText className="h-10 w-full mb-0 rounded-lg" />
          <SkeletonText className="h-10 w-full mb-0 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonTableRow = ({ columns = 7 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, idx) => (
      <td key={idx} className="py-4 px-4">
        <SkeletonText className="h-4 w-full mb-0" />
      </td>
    ))}
  </tr>
);
