import JSZip from 'jszip';
import { getAndroidProjectFiles } from '../android_source/androidCodebase';

/**
 * Generates a downloadable ZIP containing the complete native Android project
 */
export async function downloadAndroidProjectZip(onProgress?: (percent: number, status: string) => void): Promise<Blob> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  onProgress?.(10, 'Preparing project files...');

  // Add files to the archive
  files.forEach((file, index) => {
    zip.file(file.path, file.content);
    const pct = Math.round(10 + (index / files.length) * 60);
    onProgress?.(pct, `Packing ${file.path}...`);
  });

  onProgress?.(80, 'Compressing archive...');
  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    },
    metadata => {
      onProgress?.(80 + Math.round(metadata.percent * 0.2), `Compressing: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress?.(100, 'Ready for download!');

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'StoreReach-Android-APK-Source.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  return blob;
}
