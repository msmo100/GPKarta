import React, { useRef, useState } from 'react';
import type { MarkerImage } from '@gpkarta/shared';
import { imagesApi } from '../../api/images';
import { Button } from './Button';

interface ImageUploadProps {
  markerId: string;
  images: MarkerImage[];
  onImagesChange: (images: MarkerImage[]) => void;
  readOnly?: boolean;
}

export function ImageUpload({ markerId, images, onImagesChange, readOnly }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const uploaded: MarkerImage[] = [];
      for (const file of Array.from(files)) {
        const img = await imagesApi.upload(markerId, file);
        uploaded.push(img);
      }
      onImagesChange([...images, ...uploaded]);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(imageId: string) {
    await imagesApi.delete(imageId);
    onImagesChange(images.filter((i) => i.id !== imageId));
  }

  return (
    <div>
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          {images.map((img) => (
            <div key={img.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
              <img
                src={img.url}
                alt=""
                style={{ width: '100%', height: 72, objectFit: 'cover', display: 'block' }}
              />
              {!readOnly && (
                <button
                  onClick={() => handleDelete(img.id)}
                  style={{
                    position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.5)',
                    color: '#fff', border: 'none', borderRadius: '50%',
                    width: 20, height: 20, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            variant="secondary"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            + Add images
          </Button>
          {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{error}</p>}
        </>
      )}
    </div>
  );
}
