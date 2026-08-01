'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function PhotoUpload({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Formats acceptés : JPG, PNG, WebP, GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image trop lourde (5 Mo maximum).');
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      // Le préfixe `{userId}/` est exigé par la policy de stockage.
      const path = `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('proposal-photos')
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('proposal-photos').getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `Envoi impossible : ${caught.message}`
          : 'Envoi impossible.',
      );
    } finally {
      setUploading(false);
    }
  }

  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-200">
          <Image src={value} alt="" fill sizes="512px" className="object-cover" unoptimized />
        </div>
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-ink-400 underline underline-offset-4 hover:text-bordeaux-600"
        >
          Retirer la photo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-4 py-8 text-sm text-ink-400 transition hover:border-bordeaux-500 hover:text-bordeaux-600 disabled:opacity-60"
      >
        {uploading ? 'Envoi en cours…' : 'Ajouter une photo (facultatif)'}
      </button>
      {error ? <p className="text-xs font-medium text-bordeaux-600">{error}</p> : null}
    </div>
  );
}
