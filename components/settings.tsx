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
// Toast functionality is now handled by the global showToast function
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Upload, AlertCircle } from "lucide-react";
import { ChatTab } from '@/types/chat';
import { Textarea } from "@/components/ui/textarea";
import { themes } from '@/lib/themes';
import { useTheme } from '@/lib/themer';

export const IMAGE_MODELS = [
  "flux",
  "kontext", 
  "gptimage",
  "turbo",
];

export const TEXT_MODELS = [
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
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
  const [localTextModel, setLocalTextModel] = useState(selectedTextModel || "openai/gpt-oss-20b:free");
  const [localImageModel, setLocalImageModel] = useState(selectedImageModel);
  const [textModels, setTextModels] = useState<string[]>(TEXT_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [textSelectOpen, setTextSelectOpen] = useState(false);
  const [imageSelectOpen, setImageSelectOpen] = useState(false);
  const { theme, isDark, setTheme, setIsDark, toggleDarkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      // Reset local state to current saved values when dialog opens
      setLocalProfileName(profileName);
      setLocalSystemPrompt(systemPrompt);
      setLocalTextModel(selectedTextModel || "openai/gpt-oss-20b:free");
      setLocalImageModel(selectedImageModel);
    } else {
      // Ensure all select dropdowns are closed when dialog is closed
      setTextSelectOpen(false);
      setImageSelectOpen(false);
    }
  }, [isOpen, profileName, systemPrompt, selectedTextModel, selectedImageModel]);

  // Initialize with fixed models - no need to fetch from API
  useEffect(() => {
    setTextModels(TEXT_MODELS);
    setIsLoadingModels(false);
  }, []);

  const handleSaveSettings = () => {
    setProfileName(localProfileName);
    setSystemPrompt(localSystemPrompt);
    setSelectedTextModel(localTextModel);
    setSelectedImageModel(localImageModel);
    localStorage.setItem("profileName", localProfileName);
    localStorage.setItem("systemPrompt", localSystemPrompt);
    localStorage.setItem("textModel", localTextModel || "openai");
    localStorage.setItem("imageModel", localImageModel);
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast("Settings saved successfully.", "success");
    }
    setIsOpen(false);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      // Close any open select dropdowns immediately
      setTextSelectOpen(false);
      setImageSelectOpen(false);
      
      // Reset local state to saved values when dialog closes without saving
      setLocalProfileName(profileName);
      setLocalSystemPrompt(systemPrompt);
      setLocalTextModel(selectedTextModel || "openai-fast");
      setLocalImageModel(selectedImageModel);
      
      // Reset the active tab to profile
      setActiveTab("profile");
    }
    setIsOpen(open);
  };

  const exportChats = () => {
    try {
      const exportData = {
        chatTabs: chatTabs,
        chats: {} as Record<string, any>,
        settings: {
          profileName: localStorage.getItem("profileName") || "User",
          systemPrompt: localStorage.getItem("systemPrompt") || "",
          textModel: localStorage.getItem("textModel") || "openai",
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
      
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast("Chats exported successfully!", "success");
      }
    } catch (error) {
      console.error('Export error:', error);
      if (typeof window !== 'undefined' && (window as any).showToast) {
        (window as any).showToast("Failed to export chats. Please try again.", "error");
      }
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
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast("Chats imported successfully!", "success");
        }
        
        // Close the settings dialog
        setIsOpen(false);
      } catch (error) {
        console.error('Import error:', error);
        setImportError(error instanceof Error ? error.message : "Failed to import chats. Please try again.");
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast("Failed to import chats. Please check the file format.", "error");
        }
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[450px] bg-zinc-950 border border-zinc-800">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>
          Text Models by OpenRouter. Image Models by Pollinations.ai.
        </DialogDescription>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="settings">Models</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-1">
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
              {/* System Prompt moved here */}
              <div className="flex flex-col gap-3">
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
              {/* Export/Import Section */}
              <div className="grid gap-3">
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

          <TabsContent value="appearance" className="mt-1">
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

          <TabsContent value="settings" className="mt-1">
            <div className="grid gap-4 py-4">
              {/* Text Model field */}
              <div className="grid grid-cols-[auto,1fr] items-center gap-4">
                <Label htmlFor="text-model">
                  Text Model
                </Label>
                <Select
                  value={localTextModel}
                  onValueChange={setLocalTextModel}
                  disabled={isLoadingModels}
                  open={textSelectOpen}
                  onOpenChange={setTextSelectOpen}
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
                  open={imageSelectOpen}
                  onOpenChange={setImageSelectOpen}
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
          <Button variant="outline" onClick={() => handleDialogChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

