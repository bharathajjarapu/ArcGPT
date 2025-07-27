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

export const IMAGE_MODELS = [
  "flux",
  "kontext", 
  "turbo",
];

// Curated list of the most usable text models
export const DEFAULT_TEXT_MODELS = [
  "openai-fast",
  "openai",
  "mistral",
  "qwen-coder",
  "deepseek",
];

// Theme colors
export const THEME_COLORS = [
  { name: "Blue", value: "blue", class: "bg-blue-600 hover:bg-blue-700" },
  { name: "Red", value: "red", class: "bg-red-600 hover:bg-red-700" },
  { name: "Green", value: "green", class: "bg-green-600 hover:bg-green-700" },
  { name: "Purple", value: "purple", class: "bg-purple-600 hover:bg-purple-700" },
  { name: "Orange", value: "orange", class: "bg-orange-600 hover:bg-orange-700" },
  { name: "Pink", value: "pink", class: "bg-pink-600 hover:bg-pink-700" },
  { name: "Teal", value: "teal", class: "bg-teal-600 hover:bg-teal-700" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-600 hover:bg-indigo-700" },
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
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
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
  selectedTheme,
  setSelectedTheme,
}: SettingsProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [localProfileName, setLocalProfileName] = useState(profileName);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localTextModel, setLocalTextModel] = useState(selectedTextModel);
  const [localImageModel, setLocalImageModel] = useState(selectedImageModel);
  const [localTheme, setLocalTheme] = useState(selectedTheme);
  const [textModels, setTextModels] = useState<string[]>(DEFAULT_TEXT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const getThemeClasses = () => {
    const themeMap: { [key: string]: string } = {
      blue: "bg-blue-600 hover:bg-blue-700",
      red: "bg-red-600 hover:bg-red-700",
      green: "bg-green-600 hover:bg-green-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      orange: "bg-orange-600 hover:bg-orange-700",
      pink: "bg-pink-600 hover:bg-pink-700",
      teal: "bg-teal-600 hover:bg-teal-700",
      indigo: "bg-indigo-600 hover:bg-indigo-700",
    }
    return themeMap[localTheme] || themeMap.blue
  }

  const getFocusRingClass = () => {
    const focusMap: { [key: string]: string } = {
      blue: "focus:ring-blue-500/50",
      red: "focus:ring-red-500/50",
      green: "focus:ring-green-500/50",
      purple: "focus:ring-purple-500/50",
      orange: "focus:ring-orange-500/50",
      pink: "focus:ring-pink-500/50",
      teal: "focus:ring-teal-500/50",
      indigo: "focus:ring-indigo-500/50",
    }
    return focusMap[localTheme] || focusMap.blue
  }

  useEffect(() => {
    setLocalProfileName(profileName);
    setLocalSystemPrompt(systemPrompt);
    setLocalTextModel(selectedTextModel);
    setLocalImageModel(selectedImageModel);
    setLocalTheme(selectedTheme);
  }, [isOpen, profileName, systemPrompt, selectedTextModel, selectedImageModel, selectedTheme]);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setTextModels(data.map((model: any) => model.name || model));
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        // Keep default models as fallback
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  const handleSaveSettings = () => {
    setProfileName(localProfileName);
    setSystemPrompt(localSystemPrompt);
    setSelectedTextModel(localTextModel);
    setSelectedImageModel(localImageModel);
    setSelectedTheme(localTheme);
    localStorage.setItem("profileName", localProfileName);
    localStorage.setItem("systemPrompt", localSystemPrompt);
    localStorage.setItem("textModel", localTextModel);
    localStorage.setItem("imageModel", localImageModel);
    localStorage.setItem("theme", localTheme);
    toast.success("Settings saved successfully.");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border border-zinc-800">
        <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
        <DialogDescription className="text-gray-400">
          Configure your AI assistant preferences
        </DialogDescription>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full pt-5"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right font-medium">
                  Full Name
                </Label>
                                  <Input
                    id="name"
                    value={localProfileName}
                    onChange={(e) => setLocalProfileName(e.target.value)}
                    className={`col-span-3 ${getFocusRingClass()}`}
                    placeholder="Enter your name..."
                  />
              </div>

            </div>
          </TabsContent>

          <TabsContent value="models" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="system-prompt" className="text-right font-medium">
                  System Prompt
                </Label>
                <div className="col-span-3">
                  <Input
                    id="system-prompt"
                    value={localSystemPrompt}
                    onChange={(e) => setLocalSystemPrompt(e.target.value)}
                    className={getFocusRingClass()}
                    placeholder="Custom system prompt..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Customize how the AI assistant behaves
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text-model" className="text-right font-medium">
                  Text Model
                </Label>
                <div className="col-span-3">
                  <Select
                    value={localTextModel}
                    onValueChange={setLocalTextModel}
                    disabled={isLoadingModels}
                  >
                    <SelectTrigger className={getFocusRingClass()}>
                      <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select text model"} />
                    </SelectTrigger>
                    <SelectContent>
                      {textModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-1">
                    Choose the AI model for text generation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-model" className="text-right font-medium">
                  Image Model
                </Label>
                <div className="col-span-3">
                  <Select
                    value={localImageModel}
                    onValueChange={setLocalImageModel}
                  >
                    <SelectTrigger id="image-model" className={getFocusRingClass()}>
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
                  <p className="text-xs text-gray-400 mt-1">
                    Choose the AI model for image generation
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="theme" className="text-right font-medium">
                  Theme Color
                </Label>
                <div className="col-span-3">
                  <div className="grid grid-cols-4 gap-3">
                    {THEME_COLORS.map((theme) => (
                      <button
                        key={theme.value}
                        onClick={() => setLocalTheme(theme.value)}
                        className={`h-12 w-full rounded-lg border-2 transition-all ${
                          localTheme === theme.value
                            ? 'border-white scale-105 shadow-lg'
                            : 'border-gray-600 hover:border-gray-400 hover:scale-105'
                        } ${theme.class}`}
                        title={theme.name}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Choose your preferred theme color for buttons and accents
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} className={getThemeClasses()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

