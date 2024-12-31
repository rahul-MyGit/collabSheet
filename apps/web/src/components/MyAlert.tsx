import React from 'react';

const Alert = ({ variant = "destructive", children } : any) => {
  const alertClasses = `m-4 p-4 ${variant === "destructive" ? "bg-red-500 text-white" : "bg-gray-500 text-black"} rounded-lg flex items-center space-x-3`;

  return <div className={alertClasses}>{children}</div>;
};

const AlertCircle = () => (
  <div className="h-4 w-4 bg-white text-red-500 rounded-full flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" clipRule="evenodd" />
    </svg>
  </div>
);

const AlertDescription = ({ children } : any) => (
  <span className="text-sm">{children}</span>
);

const MyAlert = () => (
  <Alert variant="destructive">
    <AlertCircle />
    <AlertDescription>Failed to load document. Please try again later.</AlertDescription>
  </Alert>
);

export default MyAlert;
