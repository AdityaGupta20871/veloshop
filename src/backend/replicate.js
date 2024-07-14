const Replicate = require('replicate');

export async function generateImage() {
  try {
    const replicate = new Replicate({
      auth: 'r8_ajfYhcSIKBx3LtpqDpIyacMAMd1qHYg3PZq8U', // replace with your actual Replicate API token
    });

    const model = 'ai-forever/kandinsky-2.2:ad9d7879fbffa2874e1d909d1d37d9bc682889cc65b31f7bb00d2362619f194a';
    const input = {
      prompt: 'a white siamese cat',
    };

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
