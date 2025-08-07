import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/hooks/use-app-store';

// Smooth transition wrapper for workspace changes
export function WorkspaceTransition({ children }: { children: React.ReactNode }) {
  const { currentWorkspace } = useWorkspace();
  const [previousWorkspace, setPreviousWorkspace] = useState(currentWorkspace);

  useEffect(() => {
    if (currentWorkspace !== previousWorkspace) {
      setPreviousWorkspace(currentWorkspace);
    }
  }, [currentWorkspace, previousWorkspace]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  };

  const getDirection = () => {
    const workspaces = ['studio', 'regexr', 'settings'];
    const currentIndex = workspaces.indexOf(currentWorkspace);
    const previousIndex = workspaces.indexOf(previousWorkspace);
    return currentIndex > previousIndex ? 1 : -1;
  };

  return (
    <AnimatePresence mode="wait" custom={getDirection()}>
      <motion.div
        key={currentWorkspace}
        custom={getDirection()}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
          scale: { duration: 0.2 }
        }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Smooth loading state transitions
export function LoadingTransition({ 
  isLoading, 
  children, 
  loadingComponent 
}: { 
  isLoading: boolean;
  children: React.ReactNode;
  loadingComponent: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {loadingComponent}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Staggered list animations
export function StaggeredList({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Smooth modal transitions
export function ModalTransition({ 
  isOpen, 
  children 
}: { 
  isOpen: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hover and focus animations
export function InteractiveElement({ 
  children, 
  className = '',
  hoverScale = 1.02,
  tapScale = 0.98
}: { 
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
export function PageTransition({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
}