import React from 'react';
import { motion } from 'framer-motion';
import VoiceChatbot from '@/components/VoiceChatbot';
import Header from '@/components/Header';

const VoiceChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Voice Chat Assistant
            </h1>
            <p className="text-muted-foreground">
              Have a natural conversation and get music suggestions based on your emotions
            </p>
          </div>
          
          <div className="h-[calc(100vh-240px)]">
            <VoiceChatbot />
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default VoiceChatPage;
