import app from "./app";

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server started - visit http://localhost:${port}`);
});
