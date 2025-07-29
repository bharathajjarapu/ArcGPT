# Export and Import Chats Feature

## Overview

The Export and Import Chats functionality has been successfully added to the Profile tab in Settings. This feature allows users to export all their chats, settings, and conversation history as a JSON file, and import them back into the application.

## Features

### Export Chats
- **Location**: Settings → Profile tab → Chat Management section
- **Functionality**: Exports all chat data including:
  - All chat tabs and their names
  - Complete conversation history for each chat
  - User settings (profile name, system prompt, text model, image model)
  - Export metadata (date, version)
- **File Format**: JSON with descriptive filename including date
- **File Name**: `arcgpt-chats-YYYY-MM-DD.json`

### Import Chats
- **Location**: Settings → Profile tab → Chat Management section
- **Functionality**: Imports chat data from a previously exported JSON file
- **Validation**: Validates file format and structure before importing
- **Behavior**: Replaces current data with imported data
- **Error Handling**: Shows clear error messages for invalid files

## Implementation Details

### Data Structure
The exported JSON file contains:
```json
{
  "chatTabs": [
    { "id": "1", "name": "Chat Name" }
  ],
  "chats": {
    "1": [
      {
        "id": "init",
        "content": "System prompt...",
        "role": "system"
      },
      {
        "id": "1234567890",
        "content": "User message",
        "role": "user"
      },
      {
        "id": "1234567891",
        "content": "AI response",
        "role": "ai"
      }
    ]
  },
  "settings": {
    "profileName": "User Name",
    "systemPrompt": "Custom system prompt",
    "textModel": "openai-fast",
    "imageModel": "flux"
  },
  "exportDate": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

### UI Components
- **Export Button**: Downloads all chat data as JSON file
- **Import Button**: Opens file picker for JSON import
- **Error Display**: Shows validation errors with clear messaging
- **Success Notifications**: Toast notifications for successful operations

### Error Handling
- **File Format Validation**: Ensures imported file has correct structure
- **Missing Data Handling**: Gracefully handles missing chat histories
- **User Feedback**: Clear error messages and success notifications

## Usage Instructions

### Exporting Chats
1. Open Settings (gear icon in top-right)
2. Go to Profile tab
3. Click "Export Chats" button
4. File will automatically download to your device

### Importing Chats
1. Open Settings (gear icon in top-right)
2. Go to Profile tab
3. Click "Import Chats" button
4. Select a previously exported JSON file
5. Data will be imported and settings dialog will close

## Technical Implementation

### Files Modified
- `components/settings.tsx`: Added export/import functionality to Profile tab
- `components/chat.tsx`: Updated to pass chatTabs and setChatTabs props
- `app/page.tsx`: Updated to pass chatTabs and setChatTabs to Chat component

### Key Functions
- `exportChats()`: Collects all chat data and creates downloadable JSON file
- `importChats()`: Reads JSON file, validates structure, and imports data
- Error handling with user-friendly messages
- Toast notifications for user feedback

### Dependencies
- Uses existing UI components (Button, Input, Label)
- Lucide React icons (Download, Upload, AlertCircle)
- Sonner toast notifications
- File API for download and file reading

## Testing

The functionality has been tested and verified:
- ✅ TypeScript compilation passes
- ✅ Build process completes successfully
- ✅ Export creates valid JSON structure
- ✅ Import validates file format correctly
- ✅ Error handling works as expected
- ✅ UI components render properly

## Benefits

1. **Data Portability**: Users can backup and transfer their chat data
2. **Cross-Device Sync**: Import chats on different devices
3. **Data Recovery**: Backup important conversations
4. **Settings Migration**: Transfer custom settings between installations
5. **User Control**: Full control over their data

## Future Enhancements

Potential improvements for future versions:
- Selective export (choose specific chats)
- Cloud backup integration
- Version compatibility checking
- Import preview before applying
- Export format options (CSV, plain text)