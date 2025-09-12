import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpotifyConnect from '@/components/integrations/SpotifyConnect';
import GoogleCalendarConnect from '@/components/integrations/GoogleCalendarConnect';
import ContextualSettings from '@/components/integrations/ContextualSettings';
import ContextualPlaylistPreview from '@/components/integrations/ContextualPlaylistPreview';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const IntegrationsPage = () => {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Sidebar aiModeEnabled={false} handleAiModeToggle={() => {}} />
        
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Integrations & Settings</h1>
              <p className="text-muted-foreground">
                Connect your accounts and configure smart playlist generation
              </p>
            </div>

            <Tabs defaultValue="connections" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="connections">Connections</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="preview">Smart Playlists</TabsTrigger>
              </TabsList>

              <TabsContent value="connections" className="space-y-6">
                <SpotifyConnect onConnectionChange={setSpotifyConnected} />
                <GoogleCalendarConnect onConnectionChange={setCalendarConnected} />
              </TabsContent>

              <TabsContent value="settings">
                <ContextualSettings 
                  spotifyConnected={spotifyConnected} 
                  calendarConnected={calendarConnected} 
                />
              </TabsContent>

              <TabsContent value="preview">
                <ContextualPlaylistPreview />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IntegrationsPage;