
import React from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Waves, Trash2 } from "lucide-react";
import { RemixEffect } from "@/data";

interface EffectItemProps {
  effect: RemixEffect;
  index: number;
  effectTypeLabels: Record<string, string>;
  updateEffect: (index: number, updatedEffect: Partial<RemixEffect>) => void;
  removeEffect: (index: number) => void;
}

const EffectItem = ({ 
  effect, 
  index, 
  effectTypeLabels, 
  updateEffect, 
  removeEffect 
}: EffectItemProps) => {
  return (
    <div className="bg-gray-800 p-4 rounded-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Waves className="h-5 w-5 text-purple-400 mr-2" />
          <select 
            value={effect.type}
            onChange={(e) => {
              updateEffect(index, { type: e.target.value as RemixEffect['type'] });
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
            updateEffect(index, { value: vals[0] });
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
              updateEffect(index, { startTime: e.target.value });
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
              updateEffect(index, { endTime: e.target.value });
            }}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default EffectItem;
