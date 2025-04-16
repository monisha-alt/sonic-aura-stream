
import React from "react";
import { Button } from "@/components/ui/button";
import { FastForward, Share2 } from "lucide-react";
import { RemixType } from "@/data";

interface SavedRemixesProps {
  remixes: RemixType[];
  effectTypeLabels: Record<string, string>;
}

const SavedRemixes = ({ remixes, effectTypeLabels }: SavedRemixesProps) => {
  if (remixes.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400">No saved remixes yet</p>
        <p className="text-sm text-gray-500 mt-2">
          Create your first remix in the "Create New Remix" tab
        </p>
      </div>
    );
  }

  return (
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
  );
};

export default SavedRemixes;
