import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const loadingTexts = [
    'Initializing AI Core',
    'Loading Neural Networks',
    'Calibrating Quantum Processors',
    'Syncing Data Matrices',
  ];

  // Progress bar animation
  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => prev + 1);
      }, 40);
      return () => clearTimeout(timer);
    } else {
      navigate('/LandingPage');
    }
  }, [progress, navigate]);

  // Text animation
  useEffect(() => {
    const textIndex = Math.floor((progress / 100) * loadingTexts.length);
    const currentText = loadingTexts[Math.min(textIndex, loadingTexts.length - 1)];
    setText(currentText);
  }, [progress]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-red-600/20">
          <motion.div
            className="absolute left-0 top-0 h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 blur-3xl filter"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md space-y-8 px-4"
      >
        {/* AI Tech Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-2 text-6xl font-bold text-red-500"
          >
            AI•SOLUTIONS
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm tracking-widest text-red-400"
          >
            NEXT GENERATION ARTIFICIAL INTELLIGENCE
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="h-2 w-full overflow-hidden rounded-full bg-red-900/30"
        >
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-red-600 to-red-400"
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="space-y-4 text-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-6 text-lg font-medium text-red-500"
            >
              {text}
            </motion.div>
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-2xl font-bold text-red-400"
          >
            {progress}%
          </motion.div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-full">
          <motion.div
            className="absolute left-4 top-4 h-32 w-32 rounded-lg border border-red-500/20"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
          <motion.div
            className="absolute bottom-4 right-4 h-24 w-24 rounded-full border border-red-500/20"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
