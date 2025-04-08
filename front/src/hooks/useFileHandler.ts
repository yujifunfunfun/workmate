import { useState } from "react";


export function useFileHandler() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setValue: (name: "image", value: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("image", file);

      // プレビュー用にファイルをURLに変換
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    selectedImage,
    handleFileChange,
    convertFileToBase64,
  };
}
