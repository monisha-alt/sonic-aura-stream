
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { 
  Waveform, 
  MusicNotes, 
  FastForward, 
  Volume2, 
  Waves, 
  Save, 
  Share2,
  Plus,
  Trash2
} from "lucide-react";
import { 
  songs, 
  remixes as allRemixes, 
  RemixType, 
  RemixEffect 
} from "@/data";

interface SongRemixerProps {
  songId: string;
}

interface RemixFormValues {
  name: string;
  effects: RemixEffect[];
  isPublic: boolean;
}

const SongRemixer = ({ songId }: SongRemixerProps) => {
  const { toast } = useToast();
  const [currentSong, setCurrentSong] = useState<typeof songs[0] | null>(null);
  const [remixes, setRemixes] = useState<RemixType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const form = useForm<RemixFormValues>({
    defaultValues: {
      name: `New Remix - ${new Date().toLocaleDateString()}`,
      effects: [
        { type: "bass_boost", value: 50 },
        { type: "reverb", value: 30 }
      ],
      isPublic: false
    }
  });

  useEffect(() => {
    // Find the song
    const foundSong = songs.find(s => s.id === songId);
    setCurrentSong(foundSong || null);
    
    // Get remixes for this song
    if (allRemixes[songId]) {
      setRemixes(allRemixes[songId]);
    }
  }, [songId]);

  const addEffect = () => {
    const currentEffects = form.getValues("effects") || [];
    form.setValue("effects", [
      ...currentEffects, 
      { type: "echo", value: 50 }
    ]);
  };

  const removeEffect = (index: number) => {
    const currentEffects = form.getValues("effects") || [];
    form.setValue("effects", 
      currentEffects.filter((_, i) => i !== index)
    );
  };

  const handleSaveRemix = (data: RemixFormValues) => {
    const newRemix: RemixType = {
      id: `r${Date.now()}`,
      name: data.name,
      originalSongId: songId,
      createdBy: "currentUser", // In a real app, this would be the logged-in user's ID
      createdAt: new Date(),
      effects: data.effects,
      isPublic: data.isPublic
    };

    // Add to remixes list
    setRemixes((prev) => [newRemix, ...prev]);
    
    toast({
      title: "Remix saved!",
      description: `Your remix "${data.name}" has been saved.`,
      duration: 3000,
    });
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
    setIsPlaying(false);
    
    if (!previewMode) {
      toast({
        title: "Preview mode activated",
        description: "Now you can hear your remix effects in action!",
        duration: 2000,
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    toast({
      title: isPlaying ? "Paused" : "Playing",
      description: `${previewMode ? "Remix preview" : "Original song"}`,
      duration: 1500,
    });
  };

  const effectTypeLabels = {
    bass_boost: "Bass Boost",
    tempo: "Tempo Change",
    echo: "Echo",
    reverb: "Reverb",
    filter: "Filter"
  };

  if (!currentSong) {
    return <div className="text-center p-8">Song not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <MusicNotes className="mr-2 h-6 w-6 text-purple-500" /> 
          Remix Studio
        </h2>
        <Button
          onClick={handlePreview}
          variant={previewMode ? "secondary" : "outline"}
          className={previewMode ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
        >
          <Waveform className="mr-2 h-4 w-4" />
          {previewMode ? "Exit Preview" : "Preview Remix"}
        </Button>
      </div>

      <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <img src={currentSong.cover} alt={currentSong.title} className="h-16 w-16 rounded mr-4" />
          <div>
            <h3 className="font-medium">{currentSong.title}</h3>
            <p className="text-sm text-gray-400">{currentSong.artist}</p>
          </div>
          <div className="ml-auto">
            <Button onClick={handlePlayPause} variant="secondary" size="sm">
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        </div>

        <div className="relative h-32 w-full bg-gray-900 rounded overflow-hidden mb-4">
          {/* Visualizer mockup */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!isPlaying && (
              <p className="text-gray-500 text-sm">Press Play to see waveform</p>
            )}
            {isPlaying && (
              <div className="flex items-end space-x-1 h-full w-full px-4 py-8">
                {Array.from({ length: 40 }).map((_, i) => {
                  const height = Math.random() * 100;
                  return (
                    <div 
                      key={i} 
                      className="w-2 bg-gradient-to-t from-purple-600 to-blue-500 rounded-t"
                      style={{ 
                        height: `${height}%`,
                        opacity: previewMode ? 0.8 : 0.5
                      }} 
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Remix</TabsTrigger>
          <TabsTrigger value="saved">Saved Remixes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="p-4 bg-gray-800 bg-opacity-30 rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveRemix)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remix Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Remix" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Effects</h3>
                  <Button 
                    type="button" 
                    onClick={addEffect} 
                    variant="outline" 
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Effect
                  </Button>
                </div>

                {form.watch("effects")?.map((effect, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Waves className="h-5 w-5 text-purple-400 mr-2" />
                        <select 
                          value={effect.type}
                          onChange={(e) => {
                            const currentEffects = form.getValues("effects");
                            const updatedEffects = [...currentEffects];
                            updatedEffects[index] = {
                              ...updatedEffects[index],
                              type: e.target.value as RemixEffect['type']
                            };
                            form.setValue("effects", updatedEffects);
                          }}
                          className="bg-gray-700 border-0 rounded text-sm"
                        >
                          {Object.entries(effectTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <Button 
                        type="button" 
                        onClick={() => removeEffect(index)} 
                        variant="ghost" 
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">0%</span>
                      <Slider
                        value={[effect.value]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => {
                          const currentEffects = form.getValues("effects");
                          const updatedEffects = [...currentEffects];
                          updatedEffects[index] = {
                            ...updatedEffects[index],
                            value: vals[0]
                          };
                          form.setValue("effects", updatedEffects);
                        }}
                      />
                      <span className="text-xs text-gray-400">100%</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <label className="text-xs text-gray-400">Start Time (optional)</label>
                        <Input 
                          placeholder="0:00" 
                          value={effect.startTime || ""}
                          onChange={(e) => {
                            const currentEffects = form.getValues("effects");
                            const updatedEffects = [...currentEffects];
                            updatedEffects[index] = {
                              ...updatedEffects[index],
                              startTime: e.target.value
                            };
                            form.setValue("effects", updatedEffects);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-xs text-gray-400">End Time (optional)</label>
                        <Input 
                          placeholder="3:00" 
                          value={effect.endTime || ""}
                          onChange={(e) => {
                            const currentEffects = form.getValues("effects");
                            const updatedEffects = [...currentEffects];
                            updatedEffects[index] = {
                              ...updatedEffects[index],
                              endTime: e.target.value
                            };
                            form.setValue("effects", updatedEffects);
                          }}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <input 
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Make this remix public</FormLabel>
                      <FormDescription>
                        Allow other users to see and play your remix
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save Remix
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="saved" className="p-4 bg-gray-800 bg-opacity-30 rounded-lg">
          {remixes.length > 0 ? (
            <div className="space-y-4">
              {remixes.map((remix) => (
                <div key={remix.id} className="bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{remix.name}</h4>
                      <p className="text-xs text-gray-400">
                        Created {remix.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FastForward className="h-4 w-4 mr-2" />
                        Play
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      {remix.effects.length} effect{remix.effects.length !== 1 ? 's' : ''}:
                      {' '}
                      {remix.effects.map(e => effectTypeLabels[e.type]).join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">No saved remixes yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first remix in the "Create New Remix" tab
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SongRemixer;
