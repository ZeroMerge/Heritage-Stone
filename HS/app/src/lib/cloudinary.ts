const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

export const buildUrl = (id: string, t = "f_auto,q_auto") =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/${t}/${id}`;

export const buildDownloadUrl = (id: string) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/fl_attachment/${id}`;

export async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", PRESET);

  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, {
    method: "POST",
    body: fd,
  });

  const d = await r.json();
  if (!d.public_id) throw new Error("Cloudinary upload failed");
  return d.public_id;
}
