import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (request, response) =>{
    const movie = await prisma.movie.findMany();
    response.json(movie)
});


app.listen(port, ()=>{
    console.log(`servidor em execução na porta ${port}`);
});