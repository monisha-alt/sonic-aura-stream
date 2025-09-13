import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Settings, Zap, Users, Brain } from 'lucide-react';
import SpotifyConnect from '@/components/integrations/SpotifyConnect';
import GoogleCalendarConnect from '@/components/integrations/GoogleCalendarConnect';
import ContextualSettings from '@/components/integrations/ContextualSettings';
import ContextualPlaylistPreview from '@/components/integrations/ContextualPlaylistPreview';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const IntegrationsPage = () => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar aiModeEnabled={false} handleAiModeToggle={() => {}} />
        
        <main className="flex-1 overflow-auto p-8">
          <motion.div 
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="mb-8" variants={itemVariants}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Smart Music Integrations</h1>
                  <p className="text-muted-foreground">
                    Connect your accounts and let AI create perfect playlists for every moment
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div variants={itemVariants}>
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="p-4 text-center">
                      <Music className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold text-sm">40,000+ Songs</h3>
                      <p className="text-xs text-muted-foreground">AI-curated library</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10">
                    <CardContent className="p-4 text-center">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-secondary" />
                      <h3 className="font-semibold text-sm">Real-time Context</h3>
                      <p className="text-xs text-muted-foreground">Weather + Calendar</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
                      <h3 className="font-semibold text-sm">Personal Touch</h3>
                      <p className="text-xs text-muted-foreground">Learns your taste</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Tabs defaultValue="connections" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="connections" className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    <span className="hidden sm:inline">Connections</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="hidden sm:inline">Smart Playlists</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="connections">
                  <motion.div 
                    className="space-y-6"
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <SpotifyConnect onConnectionChange={setSpotifyConnected} />
                    <GoogleCalendarConnect onConnectionChange={setCalendarConnected} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="settings">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <ContextualSettings 
                      spotifyConnected={spotifyConnected} 
                      calendarConnected={calendarConnected} 
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="preview">
                  <motion.div
                    variants={tabContentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <ContextualPlaylistPreview />
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default IntegrationsPage;