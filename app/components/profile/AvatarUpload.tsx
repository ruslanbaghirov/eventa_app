// components/profile/AvatarUpload.tsx

"use client";

import { useState } from "react";
import Avatar from "@/app/components/ui/Avatar";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  displayName?: string;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({
  currentAvatar,
  displayName,
  onUploadComplete,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await response.json();
      onUploadComplete(url);
      toast.success("Avatar uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload avatar");
      setPreview(currentAvatar || null);
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onUploadComplete("");
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profile Picture
      </label>

      <div className="flex items-center gap-6">
        {/* Avatar Preview */}
        <div className="relative">
          <Avatar src={preview} name={displayName} size="xl" />
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          {preview && (
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500">
        JPG, PNG or GIF. Max 2MB. Recommended: 400x400px
      </p>
    </div>
  );
}
