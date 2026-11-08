// Content: files in and out of the browser. Paper has no file picker (its Field type="file" shows the browser's own button),
// and a download is an anchor that nobody sees; both are made here, out of sight.

// Ask for a file. Resolves with nothing when the picker is closed without one.
export const pickFile = (accept: string): Promise<File | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.hidden = true;
    input.addEventListener("change", () => {
      resolve(input.files?.[0] ?? null);
      input.remove();
    });
    input.addEventListener("cancel", () => {
      resolve(null);
      input.remove();
    });
    document.body.append(input);
    input.click();
  });

export const saveFile = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const isImageType = (type: string) => IMAGE_TYPES.includes(type);

// An image as the paper keeps it: scaled down to 1200 px wide at most and written into the paper as data (a signed-in
// account's images would be uploaded; here they stay in the document).
export const imageData = async (file: File): Promise<string> => {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const ratio = Math.min(1, 1200 / image.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.86);
  } finally {
    URL.revokeObjectURL(url);
  }
};
