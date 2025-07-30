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
import { Download, Upload, AlertCircle, Moon, Sun } from "lucide-react";
import { ChatTab } from '@/types/chat';
import { Textarea } from "@/components/ui/textarea";
import { themes } from '@/lib/themes';
import { useTheme } from '@/lib/theme-context';

export const IMAGE_MODELS = [
  "flux",
  "kontext", 
  "gptimage",
  "turbo",
];

// Default text models as fallback
export const DEFAULT_TEXT_MODELS = [
  "openai-fast",
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
  chatTabs: ChatTab[];
  setChatTabs: (chatTabs: ChatTab[]) => void;
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
  chatTabs,
  setChatTabs,
}: SettingsProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [localProfileName, setLocalProfileName] = useState(profileName);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [localTextModel, setLocalTextModel] = useState(selectedTextModel);
  const [localImageModel, setLocalImageModel] = useState(selectedImageModel);
  const [textModels, setTextModels] = useState<string[]>(DEFAULT_TEXT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const { theme, isDark, setTheme, setIsDark, toggleDarkMode } = useTheme();

  useEffect(() => {
    setLocalProfileName(profileName);
    setLocalSystemPrompt(systemPrompt);
    setLocalTextModel(selectedTextModel);
    setLocalImageModel(selectedImageModel);
  }, [isOpen, profileName, systemPrompt, selectedTextModel, selectedImageModel]);

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
    localStorage.setItem("profileName", localProfileName);
    localStorage.setItem("systemPrompt", localSystemPrompt);
    localStorage.setItem("textModel", localTextModel);
    localStorage.setItem("imageModel", localImageModel);
    toast.success("Settings saved successfully.");
    setIsOpen(false);
  };

  const exportChats = () => {
    try {
      const exportData = {
        chatTabs: chatTabs,
        chats: {} as Record<string, any>,
        settings: {
          profileName: localStorage.getItem("profileName") || "User",
          systemPrompt: localStorage.getItem("systemPrompt") || "",
          textModel: localStorage.getItem("textModel") || "openai-fast",
          imageModel: localStorage.getItem("imageModel") || "flux",
        },
        exportDate: new Date().toISOString(),
        version: "1.0"
      };

      // Export all chat histories
      chatTabs.forEach(chat => {
        const chatHistory = localStorage.getItem(`chat_${chat.id}`);
        if (chatHistory) {
          exportData.chats[chat.id] = JSON.parse(chatHistory);
        }
      });

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arcgpt-chats-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Chats exported successfully!");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export chats. Please try again.");
    }
  };

  const importChats = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        
        // Validate the import data structure
        if (!importData.chatTabs || !importData.chats || !importData.settings) {
          throw new Error("Invalid file format. Please select a valid ArcGPT export file.");
        }

        // Import settings
        if (importData.settings.profileName) {
          localStorage.setItem("profileName", importData.settings.profileName);
          setProfileName(importData.settings.profileName);
        }
        if (importData.settings.systemPrompt) {
          localStorage.setItem("systemPrompt", importData.settings.systemPrompt);
          setSystemPrompt(importData.settings.systemPrompt);
        }
        if (importData.settings.textModel) {
          localStorage.setItem("textModel", importData.settings.textModel);
          setSelectedTextModel(importData.settings.textModel);
        }
        if (importData.settings.imageModel) {
          localStorage.setItem("imageModel", importData.settings.imageModel);
          setSelectedImageModel(importData.settings.imageModel);
        }

        // Import chat tabs and chat histories
        setChatTabs(importData.chatTabs);
        localStorage.setItem('chatTabs', JSON.stringify(importData.chatTabs));

        // Import individual chat histories
        Object.entries(importData.chats).forEach(([chatId, chatHistory]) => {
          localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatHistory));
        });

        setImportError(null);
        toast.success("Chats imported successfully!");
        
        // Close the settings dialog
        setIsOpen(false);
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : "Failed to import chats. Please try again.");
        toast.error("Failed to import chats. Please check the file format.");
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="settings">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[auto,1fr] items-center gap-4">
                <Label htmlFor="name">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={localProfileName}
                  onChange={(e) => setLocalProfileName(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {/* Export/Import Section */}
              <div className="grid gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Backup & Restore</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={exportChats}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export Chats
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={importChats}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="import-chats"
                    />
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full"
                      asChild
                    >
                      <label htmlFor="import-chats">
                        <Upload className="h-4 w-4" />
                        Import Chats
                      </label>
                    </Button>
                  </div>
                </div>
                
                {importError && (
                  <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400">{importError}</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-4">
            <div className="grid gap-4 py-4">
              {/* Theme Selection */}
              <div className="flex flex-col gap-3">
                <Label className="text-sm font-medium">Color Theme</Label>
                <div className="theme-grid">
                  {themes.map((themeOption) => (
                    <div
                      key={themeOption.name}
                      className={`theme-preview theme-${themeOption.name} ${
                        theme === themeOption.name ? 'selected' : ''
                      }`}
                      onClick={() => setTheme(themeOption.name)}
                    >
                      {theme === themeOption.name && (
                        <span className="theme-preview-tick">
                          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 10.5L9 14.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="system-prompt">
                  System Prompt
                </Label>
                <Textarea
                  id="system-prompt"
                  value={localSystemPrompt}
                  onChange={(e) => setLocalSystemPrompt(e.target.value)}
                  className="w-full"
                  rows={3}
                />
              </div>

              {/* Text Model field */}
              <div className="grid grid-cols-[auto,1fr] items-center gap-4">
                <Label htmlFor="text-model">
                  Text Model
                </Label>
                <Select
                  value={localTextModel}
                  onValueChange={setLocalTextModel}
                  disabled={isLoadingModels}
                >
                  <SelectTrigger className="w-full">
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
              </div>

              {/* Image Model field */}
              <div className="grid grid-cols-[auto,1fr] items-center gap-4">
                <Label htmlFor="image-model">
                  Image Model
                </Label>
                <Select
                  value={localImageModel}
                  onValueChange={setLocalImageModel}
                >
                  <SelectTrigger id="image-model" className="w-full">
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

