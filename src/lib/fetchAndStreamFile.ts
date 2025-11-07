export async function fetchAndStreamFile(url: string) {
    const response = await fetch(url, {
      headers: {'Authorization': `Basic ${btoa(`${process.env.INSTRUEMENT_API_USER}:${process.env.INSTRUEMENT_API_PASS}`)}`} 
    });
    if (response.body) {
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              controller.enqueue(value);
              push();
            });
          }
          push();
        }
      });
      const newResponse = new Response(stream);
      const blob = await newResponse.blob();
      return blob;
    }
  }