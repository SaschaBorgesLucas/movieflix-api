import express from "express";
import { PrismaClient } from "@prisma/client";


const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async ( _, response) =>{
    const movie = await prisma.movie.findMany({
        orderBy: { 
            title: 'asc', 
        },
        include: { 
            genres: true, 
            languages: true,
        },
    });

    response.json(movie)
});

app.post("/movies", async(request, response)=>{
    
    const{ title, id_genre, id_language, oscar_count, release_date} = request.body;
    
    console.log(`Conteúdo enviado na requisição${request.body}`)

    try{

        const movieWithSameTitle = await prisma.movie.findFirst({
            where:{ 
                title: { equals: title, mode: "insensitive" }
            }
        })

        if(movieWithSameTitle){
            return response.status(409).send({message:"filme duplicado"});
        }

        await prisma.movie.create({
        data:{
            title,
            id_genre,
            id_language,
            oscar_count,
            release_date: new Date(release_date)
        }
    });
    }
    catch(error){
        return response.status(500).send({message:"Erro ao cadastrar o filme"});
    }
    response.status(201).send();

});


app.listen(port, ()=>{
    console.log(`servidor em execução na porta ${port}`);
});