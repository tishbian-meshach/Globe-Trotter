
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: 'us-east-1', // Required by SDK but ignored by Supabase
    endpoint: 'https://xynomfndqejqtjneeldc.storage.supabase.co/storage/v1/s3',
    credentials: {
        accessKeyId: 'd028b0082e445d63daa1da3529e37ee9',
        secretAccessKey: '54a380f449152a155d4670a78075c39f6aaadc18d2bea20ecac21752ee065cc1'
    },
    forcePathStyle: true // Important for some S3 compatible storages
});

const BUCKET_NAME = 'Images'; // Default bucket name

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const contentType = file.type;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read' // Assuming public bucket
        });

        await s3Client.send(command);

        // Construct public URL
        // Supabase S3 URLs might be tricky. Usually: endpoint + /bucket/key
        // Or standard supabase public URL: https://[project].supabase.co/storage/v1/object/public/[bucket]/[key]
        // Given endpoint: https://xynomfndqejqtjneeldc.storage.supabase.co/storage/v1/s3
        // Project ID: xynomfndqejqtjneeldc

        const publicUrl = `https://xynomfndqejqtjneeldc.supabase.co/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
    }
}
