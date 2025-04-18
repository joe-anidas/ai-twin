// utils/ipfs.ts
import axios from 'axios';

export const uploadFileToIPFS = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        timeout: 30000,
      }
    );

    return response.data.IpfsHash;
  } catch (error: any) {
    throw new Error(`IPFS Upload Failed: ${error.message}`);
  }
};

export const uploadJSONToIPFS = async (data: object) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
          pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
        },
        timeout: 30000,
      }
    );
    return response.data.IpfsHash;
  } catch (error: any) {
    throw new Error(`IPFS JSON Upload Failed: ${error.message}`);
  }
};