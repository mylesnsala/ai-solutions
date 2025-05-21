import ClientDatabiz from '../../assets/images/client-databiz.svg';
import ClientAudiophile from '../../assets/images/client-audiophile.svg';
import ClientMeet from '../../assets/images/client-meet.svg';
import ClientMaker from '../../assets/images/client-maker.svg';
import { motion } from 'framer-motion';
import Button from '../Buttons/Button';

export default function Hero() {
  return (
    <div className="relative mb-48 mt-8 overflow-hidden px-5 lg:pr-32 lg:pt-20">
      {/* Animated Gradient Background */}
      <motion.div
        className="absolute left-1/2 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-red-500/30 via-orange-400/20 to-yellow-300/10 blur-3xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: [0.8, 1.05, 1] }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ transform: 'translateX(-50%)' }}
      />
      <div className="flex flex-col items-center lg:items-start">
        <motion.h1
          className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 bg-clip-text text-4xl font-bold text-transparent drop-shadow-lg lg:text-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Watch FunOlympics Online
        </motion.h1>
        <motion.p
          className="my-6 max-w-2xl text-center text-base font-medium text-gray-400 lg:my-10 lg:pr-11 lg:text-start lg:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Watch games in sync, no matter your location. Watch games, chat with others all over the
          world, and enjoy the fun of the Olympics.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="text-base font-medium shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            Learn more
          </Button>
        </motion.div>
        {/* Animated client logos */}
        <motion.div
          className="mt-12 flex gap-8 opacity-80"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { staggerChildren: 0.15, delayChildren: 0.7 },
            },
          }}
        >
          {[ClientDatabiz, ClientAudiophile, ClientMeet, ClientMaker].map((Logo, i) => (
            <motion.img
              key={i}
              src={Logo}
              alt="Client logo"
              className="h-8 w-auto grayscale transition-all duration-300 hover:grayscale-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
