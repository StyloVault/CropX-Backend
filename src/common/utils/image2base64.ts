import fs from 'fs';

export const convertImageToBase64 = (filePath) => {
  // Read the image file as a buffer
  const imageBuffer = fs.readFileSync(filePath);

  // Convert the buffer to base64
  const base64String = imageBuffer.toString('base64');

  return base64String;
};

export const bufferToBase64 = (buffer) => {
  const base64String = buffer.toString('base64');
  return base64String;
};
