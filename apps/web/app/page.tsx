import React from "react";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          smartodo-ce
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your Next.js dashboard is ready. Start building by adding components from <code className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded">@repo/ui</code>!
        </p>
      </div>
    </div>
  );
}
