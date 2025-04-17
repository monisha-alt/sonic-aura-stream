
import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Save, Plus, Music } from "lucide-react";
import { RemixEffect } from "@/data";
import EffectItem from "./EffectItem";
import { effectTypeLabels, applyPreset } from "./remixUtils";
import { remixPresets } from "@/data/remixes";
import { useToast } from "@/hooks/use-toast";

interface RemixFormValues {
  name: string;
  effects: RemixEffect[];
  isPublic: boolean;
}

interface CreateRemixFormProps {
  onSave: (data: RemixFormValues) => void;
  defaultValues?: RemixFormValues;
}

const CreateRemixForm = ({ onSave, defaultValues }: CreateRemixFormProps) => {
  const { toast } = useToast();
  const form = useForm<RemixFormValues>({
    defaultValues: defaultValues || {
      name: `New Remix - ${new Date().toLocaleDateString()}`,
      effects: [
        { type: "bass_boost", value: 50 },
        { type: "reverb", value: 30 }
      ],
      isPublic: false
    }
  });

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

  const updateEffect = (index: number, updatedEffect: Partial<RemixEffect>) => {
    const currentEffects = form.getValues("effects");
    const updatedEffects = [...currentEffects];
    updatedEffects[index] = {
      ...updatedEffects[index],
      ...updatedEffect
    };
    form.setValue("effects", updatedEffects);
  };

  const applyPresetToForm = (presetKey: string) => {
    const preset = remixPresets[presetKey];
    if (!preset) return;

    // Update form name if it's the default name
    const currentName = form.getValues("name");
    if (currentName.startsWith("New Remix")) {
      form.setValue("name", `${preset.name} - ${new Date().toLocaleDateString()}`);
    }

    // Apply preset effects
    form.setValue("effects", [...preset.effects]);
    
    toast({
      title: `${preset.name} preset applied`,
      description: preset.description,
      duration: 2000,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
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

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Quick Presets</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(remixPresets).map(([key, preset]) => (
              <Button 
                key={key} 
                type="button" 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => applyPresetToForm(key)}
              >
                <Music className="h-3 w-3" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

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
            <EffectItem 
              key={index}
              effect={effect}
              index={index}
              effectTypeLabels={effectTypeLabels}
              updateEffect={updateEffect}
              removeEffect={removeEffect}
            />
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
  );
};

export default CreateRemixForm;
