import express from "express";
const port = 3000;
const app = express();

app.get("/movies", (request, response) =>{
    response.send("listagem de filmes");
});


app.listen(port, ()=>{
    console.log(`servidor em execução na porta ${port}`);
});