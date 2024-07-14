import { Permissions, webMethod } from "wix-web-module";
import { getSecret } from 'wix-secrets-backend'; // Import Wix Secrets Manager

export const generateImage = webMethod(
  Permissions.Anyone,
  async (prompt) => {
    try {
      const replicateApiKey = await getSecret('REPLICATE_API'); // Retrieve the API key from Wix Secrets Manager

      const Replicate = require('replicate');

      const replicate = new Replicate({
        auth: replicateApiKey,
      });

      const model = 'ai-forever/kandinsky-2.2:ad9d7879fbffa2874e1d909d1d37d9bc682889cc65b31f7bb00d2362619f194a';
      const input = { prompt };

      const output = await replicate.run(model, { input });

      if (output && output.length > 0) {
        const imageUrl = output[0];
        return imageUrl; // Return the generated image URL
      } else {
        throw new Error('No image URL found in the response');
      }
    } catch (error) {
      console.error('Error generating image:', error.message);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }
);
