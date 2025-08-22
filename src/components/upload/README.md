# Upload Manager

A comprehensive upload management system with queue, progress tracking, and error handling.

## Features

- **Queue Management**: Handles multiple uploads with configurable concurrency (default: 3)
- **Progress Tracking**: Real-time progress updates for each upload
- **Error Handling**: Automatic retry and error display
- **Cancel/Retry**: Users can cancel ongoing uploads or retry failed ones
- **Upload Tray**: Bottom-right overlay showing all upload statuses

## Components

### UploadProvider
The main context provider that manages the upload queue and state.

```tsx
import { UploadProvider } from '@/components/upload/upload-provider';

<UploadProvider>
  <App />
</UploadProvider>
```

### UploadTray
The visual component that displays upload progress and controls.

```tsx
import UploadTray from '@/components/upload/UploadTray';

<UploadTray />
```

### useUpload Hook
Hook to access upload functionality in components.

```tsx
import { useUpload } from '@/components/upload/upload-provider';

const { add, cancel, retry, clearCompleted, items } = useUpload();

// Add files to upload queue
add(files, folderId);

// Cancel an upload
cancel(uploadId);

// Retry a failed upload
retry(uploadId);

// Clear completed uploads
clearCompleted();
```

## Integration

### DropzoneCard
Automatically integrates with the upload manager when `folderId` is provided.

```tsx
<DropzoneCard folderId="folder-123" />
```

### NewMenu
Automatically integrates with the upload manager when `folderId` is provided.

```tsx
<NewMenu folderId="folder-123" />
```

## Upload States

- `queued`: Waiting to be processed
- `uploading`: Currently uploading with progress
- `done`: Successfully completed
- `error`: Failed with error message
- `canceled`: User canceled the upload

## Configuration

The upload manager can be configured by modifying the constants in `upload-provider.tsx`:

- `CONCURRENCY`: Number of simultaneous uploads (default: 3)
- API endpoint: Configured via `process.env.NEXT_PUBLIC_API_URL`
