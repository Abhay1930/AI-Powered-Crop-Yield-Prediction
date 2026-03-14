import { motion } from 'framer-motion';

const Skeleton = ({ className }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className={`bg-gray-200 rounded-lg ${className}`}
  />
);

export default Skeleton;
