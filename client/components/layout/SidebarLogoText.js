import React from 'react';

export default function SidebarLogoText({ user }) {
  const orgName = user?.organizations?.name || user?.organization?.name || "ढोल - ताशा - महासंघ";

  if (orgName === "ढोल - ताशा - महासंघ") {
    return (
      <div className="flex items-center justify-center hover:opacity-80 transition-opacity w-full overflow-hidden px-2">
        <h1 className="text-[17px] xl:text-lg font-black tracking-tight text-white text-center drop-shadow-md whitespace-nowrap">
          ढोल - ताशा - <span className="text-blue-500">महासंघ</span>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center hover:opacity-80 transition-opacity w-full">
      <h1 className="text-xl font-black tracking-tight text-white text-center line-clamp-2 drop-shadow-md">
        {orgName}
      </h1>
    </div>
  );
}
