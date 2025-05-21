import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Database, Cpu, Brain, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ContactUs from './ContactUs';
import LoginPage from './LoginPage';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const features = [
    {
      title: 'Neural Processing',
      description: 'Advanced AI algorithms for real-time data analysis',
      icon: Brain,
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Quantum Computing',
      description: 'Next-generation processing power at your fingertips',
      icon: Cpu,
      color: 'from-orange-500 to-yellow-500',
    },
    {
      title: 'Data Integration',
      description: 'Seamless integration with existing systems',
      icon: Database,
      color: 'from-yellow-500 to-red-500',
    },
  ];

  // Add particle effect
  useEffect(() => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Particle Canvas */}
      <canvas id="particle-canvas" className="absolute inset-0 z-0" />

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-red-900/20 bg-black/30 backdrop-blur-sm"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <motion.span
                className="cursor-pointer text-2xl font-bold text-red-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveSection('home')}
              >
                AI•SOLUTIONS
              </motion.span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {['Solutions', 'Technology', 'About', 'Contact Us'].map((item, index) => (
                  <motion.a
                    key={item}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => {
                      if (item === 'Contact Us') setIsContactOpen(true);
                      else setActiveSection(item.toLowerCase());
                    }}
                    className={`cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-300 hover:text-red-500 ${
                      activeSection === item.toLowerCase() ? 'text-red-500' : ''
                    }`}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Mobile menu button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="md:hidden"
            >
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full border-b border-red-900/20 bg-black/95 md:hidden"
            >
              <div className="space-y-1 px-2 pb-3 pt-2">
                {['Solutions', 'Technology', 'About', 'Contact'].map((item, index) => (
                  <motion.a
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => {
                      if (item === 'Contact') setIsContactOpen(true);
                      else setActiveSection(item.toLowerCase());
                      setIsMenuOpen(false);
                    }}
                    className={`block rounded-md px-3 py-2 text-base font-medium text-gray-300 transition-all duration-300 hover:text-red-500 ${
                      activeSection === item.toLowerCase() ? 'text-red-500' : ''
                    }`}
                    whileHover={{ x: 10 }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative flex min-h-screen items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent">
            <motion.div
              className="absolute left-1/4 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/30 blur-3xl filter"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
          <div className="lg:flex lg:items-center lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 sm:space-y-8 lg:w-1/2"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl font-bold leading-tight sm:text-5xl md:text-7xl"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent"
                >
                  Next Generation
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                >
                  Artificial Intelligence
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="max-w-xl text-lg text-gray-400 sm:text-xl"
              >
                Transform your business with cutting-edge AI solutions. Harness the power of neural
                networks and quantum computing for unprecedented results.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-col gap-4 sm:flex-row"
              >
                <motion.a
                  href="/LoginPage"
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-8 py-4 font-medium text-white shadow-lg shadow-red-500/20 transition-all duration-300 hover:from-red-600 hover:to-orange-600">
                    Get Started <ArrowRight className="h-5 w-5" />
                  </button>
                </motion.a>
                <motion.a
                  href="/SolutionsShowcase"
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button className="w-full rounded-lg border-2 border-red-500 px-8 py-4 font-medium text-red-500 transition-all duration-300 hover:bg-red-500/10">
                    Learn More
                  </button>
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-12 grid gap-4 sm:gap-6 lg:mt-0 lg:w-1/2"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group rounded-lg border border-red-500/20 bg-gradient-to-r from-red-500/5 to-orange-500/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-red-500/40"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`rounded-lg bg-gradient-to-r p-3 ${feature.color} bg-opacity-10 transition-all duration-300 group-hover:bg-opacity-20`}
                    >
                      <feature.icon className="h-6 w-6 text-red-500" />
                    </motion.div>
                    <div>
                      <h3 className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-xl font-semibold text-transparent">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-base text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {isContactOpen && <ContactUs onClose={() => setIsContactOpen(false)} />}
      </AnimatePresence>

      {/* Login Form Modal */}
      <AnimatePresence>
        {isLoginOpen && <LoginPage onClose={() => setIsLoginOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
