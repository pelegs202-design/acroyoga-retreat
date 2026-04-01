'use client';
import { useState, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type Props = {
  currentImageUrl: string | null;
  onUploadComplete: (url: string) => void;
};

export function AvatarUpload({ currentImageUrl, onUploadComplete }: Props) {
  const t = useTranslations('profile');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const blob = await upload(`avatars/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/avatar',
      });
      setPreviewUrl(blob.url);
      onUploadComplete(blob.url);
    } catch {
      console.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-neutral-700 bg-neutral-800">
        {previewUrl ? (
          <Image src={previewUrl} alt="Profile" fill className="object-cover" sizes="112px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-neutral-500">
            ?
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-sm text-brand hover:text-brand-muted disabled:opacity-50"
      >
        {uploading ? '...' : t('photoUpload')}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
