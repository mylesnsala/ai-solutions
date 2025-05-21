import React, { useState, useEffect } from 'react';

const Help = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    const bounceInterval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 300);
    }, 5000); // Bounce every 5 seconds

    return () => clearInterval(bounceInterval);
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-24 z-50 transition-all duration-300 ${isBouncing ? 'animate-bounce' : ''}`}
    >
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-gradient-to-r from-gray-900 to-black p-4 text-white shadow-lg transition-all duration-300 hover:from-gray-800 hover:to-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      ) : (
        <div className="animate-fadeIn flex h-[32rem] w-80 flex-col rounded-lg bg-gradient-to-br from-gray-900 to-black shadow-xl">
          <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-gray-900 to-black p-4 text-white">
            <h3 className="font-semibold">Help Center</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white transition-colors hover:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="rounded-lg bg-gray-800 p-4 text-white">
              <h4 className="mb-2 font-semibold">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <button className="text-blue-400 transition-colors hover:text-blue-300">
                    Getting Started Guide
                  </button>
                </li>
                <li>
                  <button className="text-blue-400 transition-colors hover:text-blue-300">
                    FAQ
                  </button>
                </li>
                <li>
                  <button className="text-blue-400 transition-colors hover:text-blue-300">
                    Contact Support
                  </button>
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-gray-800 p-4 text-white">
              <h4 className="mb-2 font-semibold">Common Questions</h4>
              <div className="space-y-2">
                <details className="group">
                  <summary className="cursor-pointer transition-colors hover:text-blue-400">
                    How do I get started?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    Follow our getting started guide to set up your account and begin using our
                    services.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer transition-colors hover:text-blue-400">
                    What features are available?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    We offer a wide range of features including AI solutions, consulting, and
                    training services.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer transition-colors hover:text-blue-400">
                    How can I contact support?
                  </summary>
                  <p className="mt-2 text-gray-300">
                    You can reach our support team through the contact form or by using the chat
                    assistant.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
