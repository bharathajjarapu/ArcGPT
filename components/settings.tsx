import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const TEXT_MODELS = [
  "openai",
  "mistral",
  "mistral-large",
  "llama",
  "command-r",
  "searchgpt",
  "evil",
  "qwen-coder",
  "p1",
];

export const IMAGE_MODELS = [
  "flux",
  "flux-realism",
  "flux-cablyai",
  "flux-anime",
  "flux-3d",
  "any-dark",
  "flux-pro",
  "turbo",
];

interface SettingsProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  systemPrompt: string;
  setSystemPrompt: (systemPrompt: string) => void;
  selectedTextModel: string;
  setSelectedTextModel: (selectedTextModel: string) => void;
  selectedImageModel: string;
  setSelectedImageModel: (selectedImageModel: string) => void;
  profileName: string;
  setProfileName: (name: string) => void;
}

export const Settings = ({
  isOpen,
  setIsOpen,
  systemPrompt,
  setSystemPrompt,
  selectedTextModel,
  setSelectedTextModel,
  selectedImageModel,
  setSelectedImageModel,
  profileName,
  setProfileName,
}: SettingsProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [localProfileName, setLocalProfileName] = useState(profileName);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localTextModel, setLocalTextModel] = useState(selectedTextModel);
  const [localImageModel, setLocalImageModel] = useState(selectedImageModel);

  useEffect(() => {
    setLocalProfileName(profileName);
    setLocalSystemPrompt(systemPrompt);
    setLocalTextModel(selectedTextModel);
    setLocalImageModel(selectedImageModel);
  }, [isOpen, profileName, systemPrompt, selectedTextModel, selectedImageModel]);

  const handleSaveSettings = () => {
    setProfileName(localProfileName);
    setSystemPrompt(localSystemPrompt);
    setSelectedTextModel(localTextModel);
    setSelectedImageModel(localImageModel);
    localStorage.setItem("profileName", localProfileName);
    localStorage.setItem("systemPrompt", localSystemPrompt);
    localStorage.setItem("textModel", localTextModel);
    localStorage.setItem("imageModel", localImageModel);
    toast.success("Settings saved successfully.");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[450px] bg-zinc-950 border border-zinc-800">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Text & Image Models Powered by Pollinations.ai
        </DialogDescription>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full pt-5"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={localProfileName}
                  onChange={(e) => setLocalProfileName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="system-prompt" className="text-right">
                  System
                </Label>
                <Input
                  id="system-prompt"
                  value={localSystemPrompt}
                  onChange={(e) => setLocalSystemPrompt(e.target.value)}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text-model" className="text-right">
                  Text Model
                </Label>
                <Select
                  value={localTextModel}
                  onValueChange={setLocalTextModel}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select text model" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEXT_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-model" className="text-right">
                  Image Model
                </Label>
                <Select
                  value={localImageModel}
                  onValueChange={setLocalImageModel}
                >
                  <SelectTrigger id="image-model" className="col-span-3">
                    <SelectValue placeholder="Select image model" />
                  </SelectTrigger>
                  <SelectContent>
                    {IMAGE_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

