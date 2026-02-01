import { supabase } from './supabaseClient';

const BUCKET_NAME = 'client-photos';

export async function uploadClientPhoto(
    clientId: string,
    file: File,
    type: 'before' | 'after'
): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientId}/${type}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (error) {
        console.error('Upload error:', error);
        return null;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
}

export async function getClientPhotoUrl(path: string): Promise<string> {
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
    return data.publicUrl;
}
