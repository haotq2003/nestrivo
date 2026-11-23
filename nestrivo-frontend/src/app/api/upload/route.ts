import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary phía Server với API Secret bảo mật
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dturncvxv",
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "467984999236351",
  api_secret: process.env.CLOUDINARY_API_SECRET || "2rtrEo0YjbAHx801G6yhntPCoJM",
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "nestrivo/listings";

    if (!file) {
      return NextResponse.json(
        { message: "Không tìm thấy file ảnh để tải lên." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tải ảnh trực tiếp lên Cloudinary thông qua stream bảo mật có API Secret
    const uploadResult = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as Record<string, unknown>);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      originalFilename: file.name,
    });
  } catch (error: unknown) {
    console.error("Cloudinary server upload error:", error);
    const msg = error instanceof Error ? error.message : "Lỗi khi upload ảnh lên Cloudinary.";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

