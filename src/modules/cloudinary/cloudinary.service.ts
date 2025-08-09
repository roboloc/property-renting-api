import {
  v2 as cloudinary,
  DeleteApiResponse,
  UploadApiResponse,
} from "cloudinary";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../../config/env";
import { Readable } from "stream";

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      cloud_name: CLOUDINARY_CLOUD_NAME,
    });
  }

  private bufferToStream = (buffer: Buffer) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
  };

  upload = (file: Express.Multer.File): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
      const readableStream = this.bufferToStream(file.buffer);

      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result: UploadApiResponse) => {
          console.log(error);

          if (error) return reject(error);
          resolve(result);
        }
      );

      readableStream.pipe(uploadStream);
    });
  };

  private extractPublicIdFromUrl = (url: string) => {
    const urlParts = url.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    return publicId;
  };

  remove = async (secureUrl: string) => {
    // public id dapat dilihat pada link yang bagian v173772 pada link
    const publicId = this.extractPublicIdFromUrl(secureUrl);
    return await cloudinary.uploader.destroy(publicId);
  };
}
