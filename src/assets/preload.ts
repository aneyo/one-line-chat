const preloaded = [];

export async function preloadImages(images: string[]) {
  let loadedn = 0;
  (
    (await Promise.allSettled(images.map((image) => loadImage(image)))) as {
      status: string;
      value: HTMLImageElement;
    }[]
  ).forEach((image) => {
    if (image.status === "fulfilled") {
      loadedn++;
      preloaded.push(image);
    }
  });

  return loadedn;
}

function loadImage(url: string) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
  });
}
