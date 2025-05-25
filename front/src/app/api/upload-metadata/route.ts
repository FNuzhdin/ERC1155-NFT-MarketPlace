import { NextRequest, NextResponse } from "next/server";
import { uploadMetadatas } from "@/utils/uploadMetadatas";

export async function POST(req: NextRequest) {
  try {
    // Получаем multipart/form-data
    const formData = await req.formData();

    /* в консп весь этот файл с подробными комментариями */
    // Получаем массивы файлов
    /* используем getAll, чтобы получить массив из formData */
    const images = formData.getAll("images") as File[];
    const names = formData.getAll("names") as string[];
    const descriptions = formData.getAll("descriptions") as string[];

    const result = await uploadMetadatas(names, descriptions, images);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}