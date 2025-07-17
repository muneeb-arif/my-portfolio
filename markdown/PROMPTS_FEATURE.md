# Prompts Feature Documentation

## Overview
The Prompts feature allows users to create and manage AI prompts and templates separately from regular projects. Prompts are stored in the same `projects` table but are distinguished by the `is_prompt` field.

## Database Changes
- Added `is_prompt` column to `projects` table (TINYINT DEFAULT 0)
- Existing projects have `is_prompt = 0` (regular projects)
- New prompts have `is_prompt = 1`

## Dashboard Features

### PromptsManager Component
- **Location**: `src/components/dashboard/PromptsManager.js`
- **Purpose**: Manage prompts in the dashboard
- **Features**:
  - Create new prompts
  - Edit existing prompts
  - Delete prompts
  - Publish/unpublish prompts
  - Image management
  - Pagination

### Simplified Form Fields
Prompts have fewer fields compared to regular projects:
- ✅ Title (required)
- ✅ Description (required)
- ✅ Category
- ✅ Live URL (optional)
- ✅ Status (draft/published)
- ✅ Images
- ❌ Detailed Overview (removed)
- ❌ GitHub URL (removed)
- ❌ Technologies Used (removed)
- ❌ Key Features (removed)

### Settings Integration
- **Location**: Dashboard > Settings > Homepage Section Visibility
- **Setting**: `section_prompts_visible`
- **Default**: `false` (hidden)
- **Purpose**: Control whether prompts section appears on the frontend

## Frontend Features

### PromptsSection Component
- **Location**: `src/components/PromptsSection.js`
- **Purpose**: Display prompts on the frontend
- **Features**:
  - Category filtering
  - Card-based layout
  - Modal popup with copy functionality
  - Responsive design

### Modal Enhancements
- **Location**: `src/components/Modal.js`
- **New Prop**: `isPrompt` (boolean)
- **Prompt Mode Features**:
  - Simplified content (no technologies/features)
  - Copy button for prompt text
  - Different styling for prompt content

## API Changes

### Projects API
- **Endpoint**: `POST /api/projects`
- **New Field**: `is_prompt` (number, 0 or 1)
- **Purpose**: Distinguish between projects and prompts

### ProjectService
- **Location**: `api/src/services/projectService.ts`
- **Changes**:
  - `createProject()`: Added `is_prompt` field support
  - `updateProject()`: Added `is_prompt` field support
  - Database queries include `is_prompt` column

## Usage Instructions

### Creating a Prompt
1. Go to Dashboard > Prompts
2. Click "Create Prompt"
3. Fill in the required fields (Title, Description)
4. Add optional fields (Category, Live URL, Images)
5. Set status to "Published" to make it visible on frontend
6. Save the prompt

### Managing Prompts
1. Go to Dashboard > Prompts
2. Use the grid view to see all prompts
3. Click "Edit" to modify a prompt
4. Click "Delete" to remove a prompt
5. Use "Publish/Unpublish" to control visibility

### Frontend Display
1. Go to Dashboard > Settings
2. Check "💡 Prompts Section" to show prompts on frontend
3. Save settings
4. Prompts will appear on the homepage (if published)

### Using Prompts
1. Navigate to the Prompts section on the frontend
2. Browse prompts by category
3. Click on a prompt card to open details
4. Use the "Copy" button to copy the prompt text
5. Use the prompt text with AI tools

## Technical Details

### Component Hierarchy
```
DashboardLayout
└── PromptsManager (Dashboard)
    └── MediaSelectionModal

App
└── PromptsSection (Frontend)
    └── Modal (with isPrompt=true)
```

### Data Flow
1. User creates prompt in dashboard
2. `is_prompt = 1` is set in database
3. Frontend filters projects where `is_prompt = 1`
4. Prompts are displayed in PromptsSection
5. Settings control visibility

### Styling
- Uses existing `ProjectsManager.css` for dashboard
- Custom `PromptsSection.css` for frontend
- Responsive design with Tailwind CSS

## Testing Checklist

- [ ] Database column added successfully
- [ ] Dashboard prompts section appears
- [ ] Can create new prompts
- [ ] Form shows only simplified fields
- [ ] `is_prompt = 1` is set when saved
- [ ] Settings toggle works
- [ ] Frontend prompts section appears/disappears
- [ ] Copy functionality works in modals
- [ ] Category filtering works
- [ ] Responsive design works on mobile

## Future Enhancements

- Prompt templates/categories
- Prompt sharing functionality
- Prompt analytics/usage tracking
- Bulk prompt operations
- Prompt versioning
- Prompt search functionality 