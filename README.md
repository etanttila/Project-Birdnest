This is Ella Anttila's implementation of the assignment (Project Birdnest)[https://assignments.reaktor.com/birdnest/].

Unfortunately the page does not update the list on it's own at the moment, rather the user has to refresh the page.
I was not able to implement automatic updation with my knowledge (and the time that I had to implement the solution). I suppose one might use Web Sockets to implement the functionality in a way that it would listen to the server, but I don't have experience using Web Sockets.

Even though the application is quite small and could very well consist of a few files, I have used a folder structure, which would allow the expansion of the service without having to significantly refactor the code.

## Running the application locally

The application can be run locally by running the command `deno run --allow-all --unstable run-locally.js`.